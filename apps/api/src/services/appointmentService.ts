import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AppointmentStatus } from '@inksync/shared';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination';
import { sendEmail, getAppointmentConfirmationEmailHtml } from '../utils/email';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from './googleCalendarService';

export async function getAppointments(userId: string, role: string, query: {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
}) {
  const { page, limit, skip } = getPaginationOptions(query);

  const where = {
    ...(role === 'CLIENT' ? { clientId: userId } : {}),
    ...(role === 'ARTIST' ? { artist: { userId } } : {}),
    ...(query.status ? { status: query.status } : {}),
  };

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        client: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        artist: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { startTime: 'desc' },
    }),
    prisma.appointment.count({ where }),
  ]);

  return { appointments, meta: buildPaginationMeta(total, { page, limit, skip }) };
}

export async function getAppointmentById(id: string, userId: string, role: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      artist: {
        include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      },
      payments: true,
      waiver: true,
    },
  });

  if (!appointment) throw new AppError(404, 'Appointment not found');

  const isClient = appointment.clientId === userId;
  const isArtist = appointment.artist.userId === userId;
  if (!isClient && !isArtist && role !== 'ADMIN') {
    throw new AppError(403, 'Not authorized');
  }

  return appointment;
}

export async function createAppointment(clientId: string, data: {
  artistId: string;
  startTime: Date;
  endTime: Date;
  serviceType: string;
  description?: string;
  estimatedHours?: number;
  depositAmount?: number;
  notes?: string;
}) {
  const artist = await prisma.artistProfile.findUnique({
    where: { id: data.artistId },
    include: { user: true },
  });
  if (!artist) throw new AppError(404, 'Artist not found');
  if (!artist.isAvailable) throw new AppError(400, 'Artist is not available');

  const conflict = await prisma.appointment.findFirst({
    where: {
      artistId: data.artistId,
      status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      OR: [
        { startTime: { lt: data.endTime }, endTime: { gt: data.startTime } },
      ],
    },
  });
  if (conflict) throw new AppError(409, 'Time slot is not available');

  const appointment = await prisma.appointment.create({
    data: {
      clientId,
      artistId: data.artistId,
      startTime: data.startTime,
      endTime: data.endTime,
      serviceType: data.serviceType,
      description: data.description,
      estimatedHours: data.estimatedHours,
      depositAmount: data.depositAmount,
      notes: data.notes,
      status: AppointmentStatus.PENDING,
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, email: true } },
      artist: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });

  await prisma.chatRoom.create({ data: { appointmentId: appointment.id } });

  return appointment;
}

export async function updateAppointment(id: string, userId: string, role: string, data: {
  status?: AppointmentStatus;
  notes?: string;
  startTime?: Date;
  endTime?: Date;
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { artist: true },
  });
  if (!appointment) throw new AppError(404, 'Appointment not found');

  const isArtist = appointment.artist.userId === userId;
  if (!isArtist && role !== 'ADMIN') throw new AppError(403, 'Not authorized');

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      ...data,
      ...(data.status === AppointmentStatus.CONFIRMED ? { confirmedAt: new Date() } : {}),
      ...(data.status === AppointmentStatus.COMPLETED ? { completedAt: new Date() } : {}),
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, email: true } },
      artist: { include: { user: { select: { firstName: true, lastName: true } } } },
    },
  });

  if (data.status === AppointmentStatus.CONFIRMED) {
    const dateStr = updated.startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = updated.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    await sendEmail({
      to: updated.client.email,
      subject: 'Appointment Confirmed – InkSync',
      html: getAppointmentConfirmationEmailHtml(
        `${updated.client.firstName} ${updated.client.lastName}`,
        `${updated.artist.user.firstName} ${updated.artist.user.lastName}`,
        dateStr,
        timeStr
      ),
    }).catch(console.error);

    await createCalendarEvent(updated.artist.userId, {
      appointmentId: updated.id,
      title: `Tattoo Appointment - ${updated.client.firstName} ${updated.client.lastName}`,
      startTime: updated.startTime,
      endTime: updated.endTime,
      description: updated.description ?? '',
    }).catch(console.error);
  }

  return updated;
}

export async function cancelAppointment(id: string, userId: string, role: string, reason?: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { artist: true },
  });
  if (!appointment) throw new AppError(404, 'Appointment not found');

  const isClient = appointment.clientId === userId;
  const isArtist = appointment.artist.userId === userId;
  if (!isClient && !isArtist && role !== 'ADMIN') throw new AppError(403, 'Not authorized');

  if (appointment.status === AppointmentStatus.CANCELLED) {
    throw new AppError(400, 'Appointment is already cancelled');
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus.CANCELLED,
      cancelReason: reason,
      cancelledAt: new Date(),
    },
  });

  if (appointment.googleCalendarEventId) {
    await deleteCalendarEvent(appointment.artist.userId, appointment.googleCalendarEventId).catch(console.error);
  }

  return updated;
}

export async function rescheduleAppointment(id: string, userId: string, role: string, data: {
  startTime: Date;
  endTime: Date;
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { artist: true },
  });
  if (!appointment) throw new AppError(404, 'Appointment not found');

  const isClient = appointment.clientId === userId;
  const isArtist = appointment.artist.userId === userId;
  if (!isClient && !isArtist && role !== 'ADMIN') throw new AppError(403, 'Not authorized');

  if (appointment.status === AppointmentStatus.CANCELLED || appointment.status === AppointmentStatus.COMPLETED) {
    throw new AppError(400, 'Cannot reschedule this appointment');
  }

  const conflict = await prisma.appointment.findFirst({
    where: {
      id: { not: id },
      artistId: appointment.artistId,
      status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      startTime: { lt: data.endTime },
      endTime: { gt: data.startTime },
    },
  });
  if (conflict) throw new AppError(409, 'Time slot is not available');

  const updated = await prisma.appointment.update({
    where: { id },
    data: { startTime: data.startTime, endTime: data.endTime },
  });

  if (appointment.googleCalendarEventId) {
    await updateCalendarEvent(appointment.artist.userId, appointment.googleCalendarEventId, {
      startTime: data.startTime,
      endTime: data.endTime,
    }).catch(console.error);
  }

  return updated;
}
