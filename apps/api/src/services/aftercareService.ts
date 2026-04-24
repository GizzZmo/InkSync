import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getPresignedUploadUrl } from '../utils/s3Upload';

const DEFAULT_MILESTONES = [
  { dayNumber: 1, title: 'Day 1 – Fresh Tattoo', instructions: 'Keep the bandage on for 2-4 hours. When you remove it, gently wash with fragrance-free soap and warm water. Pat dry and apply a thin layer of unscented moisturizer.' },
  { dayNumber: 3, title: 'Day 3 – Peeling Begins', instructions: 'Your tattoo may start to peel. Do NOT pick or scratch. Continue cleaning 2-3 times daily and moisturizing.' },
  { dayNumber: 7, title: 'Week 1 – Healing Progress', instructions: 'The outer layers should be mostly healed. Continue moisturizing. Avoid sun exposure and swimming.' },
  { dayNumber: 30, title: 'Month 1 – Final Healing', instructions: 'Your tattoo should be fully healed. The colors may appear slightly faded as the skin settles. Use SPF 30+ when exposed to sunlight to preserve colors.' },
];

export async function getAftercare(appointmentId: string, userId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { artist: true },
  });
  if (!appointment) throw new AppError(404, 'Appointment not found');

  const isClient = appointment.clientId === userId;
  const isArtist = appointment.artist.userId === userId;
  if (!isClient && !isArtist) throw new AppError(403, 'Not authorized');

  const aftercare = await prisma.aftercare.findUnique({
    where: { appointmentId },
    include: {
      milestones: { orderBy: { dayNumber: 'asc' } },
      photos: { orderBy: { uploadedAt: 'asc' } },
      products: true,
    },
  });

  return aftercare;
}

export async function createAftercare(appointmentId: string, artistUserId: string, data: {
  instructions: string;
  customMilestones?: Array<{ dayNumber: number; title: string; instructions: string }>;
  products?: Array<{ name: string; description?: string; affiliateUrl?: string }>;
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { artist: true },
  });
  if (!appointment) throw new AppError(404, 'Appointment not found');
  if (appointment.artist.userId !== artistUserId) throw new AppError(403, 'Not authorized');

  const existing = await prisma.aftercare.findUnique({ where: { appointmentId } });
  if (existing) throw new AppError(409, 'Aftercare plan already exists for this appointment');

  const milestones = data.customMilestones ?? DEFAULT_MILESTONES;

  return prisma.aftercare.create({
    data: {
      appointmentId,
      artistId: appointment.artistId,
      instructions: data.instructions,
      milestones: { create: milestones },
      products: { create: data.products ?? [] },
    },
    include: {
      milestones: { orderBy: { dayNumber: 'asc' } },
      products: true,
    },
  });
}

export async function updateAftercare(aftercareId: string, artistUserId: string, data: {
  instructions?: string;
}) {
  const aftercare = await prisma.aftercare.findUnique({
    where: { id: aftercareId },
    include: { artist: true },
  });
  if (!aftercare) throw new AppError(404, 'Aftercare not found');
  if (aftercare.artist.userId !== artistUserId) throw new AppError(403, 'Not authorized');

  return prisma.aftercare.update({
    where: { id: aftercareId },
    data,
    include: {
      milestones: { orderBy: { dayNumber: 'asc' } },
      photos: { orderBy: { uploadedAt: 'asc' } },
      products: true,
    },
  });
}

export async function getPhotoUploadUrl(aftercareId: string, userId: string, mimeType: string) {
  const aftercare = await prisma.aftercare.findUnique({
    where: { id: aftercareId },
    include: { appointment: { include: { artist: true } } },
  });
  if (!aftercare) throw new AppError(404, 'Aftercare not found');

  const isClient = aftercare.appointment.clientId === userId;
  const isArtist = aftercare.appointment.artist.userId === userId;
  if (!isClient && !isArtist) throw new AppError(403, 'Not authorized');

  return getPresignedUploadUrl(`aftercare/${aftercareId}`, mimeType);
}

export async function addPhoto(aftercareId: string, clientId: string, data: {
  s3Key: string;
  url: string;
  dayNumber: number;
}) {
  const aftercare = await prisma.aftercare.findUnique({
    where: { id: aftercareId },
    include: { appointment: true },
  });
  if (!aftercare) throw new AppError(404, 'Aftercare not found');
  if (aftercare.appointment.clientId !== clientId) throw new AppError(403, 'Not authorized');

  return prisma.aftercarePhoto.create({
    data: {
      aftercareId,
      url: data.url,
      s3Key: data.s3Key,
      dayNumber: data.dayNumber,
    },
  });
}

export async function addPhotoComment(photoId: string, artistUserId: string, comment: string) {
  const photo = await prisma.aftercarePhoto.findUnique({
    where: { id: photoId },
    include: { aftercare: { include: { artist: true } } },
  });
  if (!photo) throw new AppError(404, 'Photo not found');
  if (photo.aftercare.artist.userId !== artistUserId) throw new AppError(403, 'Not authorized');

  return prisma.aftercarePhoto.update({
    where: { id: photoId },
    data: { artistComment: comment },
  });
}

export async function completeMilestone(milestoneId: string, userId: string) {
  const milestone = await prisma.aftercareMilestone.findUnique({
    where: { id: milestoneId },
    include: { aftercare: { include: { appointment: true } } },
  });
  if (!milestone) throw new AppError(404, 'Milestone not found');
  if (milestone.aftercare.appointment.clientId !== userId) throw new AppError(403, 'Not authorized');

  return prisma.aftercareMilestone.update({
    where: { id: milestoneId },
    data: { completed: true, completedAt: new Date() },
  });
}
