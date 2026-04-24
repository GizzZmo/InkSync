import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { WaiverStatus } from '@inksync/shared';
import PDFDocument from 'pdfkit';
import { uploadToS3 } from '../utils/s3Upload';

interface WaiverForPdf {
  template?: { title?: string; content?: string } | null;
  appointment?: {
    client?: { firstName?: string; lastName?: string } | null;
    artist?: { user?: { firstName?: string; lastName?: string } | null } | null;
  } | null;
  signedAt?: Date | null;
  medicalHistory?: Record<string, unknown> | null;
  signatureData?: string | null;
}

export async function getWaiverTemplates(artistId: string) {
  return prisma.waiverTemplate.findMany({
    where: { artistId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createWaiverTemplate(artistId: string, userId: string, data: {
  title: string;
  content: string;
}) {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) throw new AppError(404, 'Artist not found');
  if (artist.userId !== userId) throw new AppError(403, 'Not authorized');

  await prisma.waiverTemplate.updateMany({
    where: { artistId, title: data.title, isActive: true },
    data: { isActive: false },
  });

  const latest = await prisma.waiverTemplate.findFirst({
    where: { artistId, title: data.title },
    orderBy: { version: 'desc' },
  });

  return prisma.waiverTemplate.create({
    data: {
      artistId,
      title: data.title,
      content: data.content,
      version: (latest?.version ?? 0) + 1,
    },
  });
}

export async function updateWaiverTemplate(templateId: string, userId: string, data: {
  title?: string;
  content?: string;
  isActive?: boolean;
}) {
  const template = await prisma.waiverTemplate.findUnique({
    where: { id: templateId },
    include: { artist: true },
  });
  if (!template) throw new AppError(404, 'Template not found');
  if (template.artist.userId !== userId) throw new AppError(403, 'Not authorized');

  return prisma.waiverTemplate.update({ where: { id: templateId }, data });
}

export async function createWaiver(data: {
  appointmentId: string;
  templateId: string;
  clientId: string;
  medicalHistory?: Record<string, unknown>;
}) {
  const appointment = await prisma.appointment.findUnique({ where: { id: data.appointmentId } });
  if (!appointment) throw new AppError(404, 'Appointment not found');
  if (appointment.clientId !== data.clientId) throw new AppError(403, 'Not authorized');

  const existing = await prisma.waiver.findUnique({ where: { appointmentId: data.appointmentId } });
  if (existing) throw new AppError(409, 'Waiver already exists for this appointment');

  return prisma.waiver.create({ data: { ...data, status: WaiverStatus.DRAFT } });
}

export async function signWaiver(waiverId: string, clientId: string, data: {
  signatureData: string;
  medicalHistory?: Record<string, unknown>;
}) {
  const waiver = await prisma.waiver.findUnique({
    where: { id: waiverId },
    include: { template: true, appointment: { include: { client: true, artist: { include: { user: true } } } } },
  });
  if (!waiver) throw new AppError(404, 'Waiver not found');
  if (waiver.clientId !== clientId) throw new AppError(403, 'Not authorized');
  if (waiver.status === WaiverStatus.SIGNED) throw new AppError(400, 'Waiver already signed');

  const signed = await prisma.waiver.update({
    where: { id: waiverId },
    data: {
      signatureData: data.signatureData,
      medicalHistory: data.medicalHistory,
      signedAt: new Date(),
      status: WaiverStatus.SIGNED,
    },
  });

  generateAndStorePdf(signed.id, waiver).catch(console.error);

  return signed;
}

export async function getWaiver(waiverId: string, userId: string) {
  const waiver = await prisma.waiver.findUnique({
    where: { id: waiverId },
    include: {
      template: true,
      appointment: {
        include: {
          client: { select: { id: true, firstName: true, lastName: true } },
          artist: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        },
      },
    },
  });
  if (!waiver) throw new AppError(404, 'Waiver not found');

  const isClient = waiver.clientId === userId;
  const isArtist = waiver.appointment.artist.userId === userId;
  if (!isClient && !isArtist) throw new AppError(403, 'Not authorized');

  return waiver;
}

async function generateAndStorePdf(waiverId: string, waiver: WaiverForPdf): Promise<void> {
  const pdf = await generateWaiverPdf(waiver);
  const { s3Key, url } = await uploadToS3(pdf, 'application/pdf', `waivers/${waiverId}`);
  await prisma.waiver.update({
    where: { id: waiverId },
    data: { pdfS3Key: s3Key, pdfUrl: url },
  });
}

export async function generateWaiverPdf(waiver: WaiverForPdf): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('InkSync Tattoo Waiver', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(waiver.template?.title ?? 'Tattoo Consent Form');
    doc.moveDown();
    doc.fontSize(10).text(`Client: ${waiver.appointment?.client?.firstName} ${waiver.appointment?.client?.lastName}`);
    doc.text(`Artist: ${waiver.appointment?.artist?.user?.firstName} ${waiver.appointment?.artist?.user?.lastName}`);
    doc.text(`Date: ${waiver.signedAt ? new Date(waiver.signedAt).toLocaleDateString() : 'N/A'}`);
    doc.moveDown();
    doc.fontSize(11).text('Terms & Conditions:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(waiver.template?.content ?? '', { align: 'justify' });

    if (waiver.medicalHistory) {
      doc.moveDown();
      doc.fontSize(11).text('Medical History:', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).text(JSON.stringify(waiver.medicalHistory, null, 2));
    }

    if (waiver.signatureData) {
      doc.moveDown(2);
      doc.fontSize(11).text('Signature:', { underline: true });
      doc.moveDown(0.5);
      try {
        const imgBuffer = Buffer.from(waiver.signatureData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        doc.image(imgBuffer, { width: 200 });
      } catch {
        doc.text('[Signature on file]');
      }
    }

    doc.end();
  });
}
