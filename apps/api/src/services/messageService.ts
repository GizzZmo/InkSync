import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination';
import { MessageType } from '@inksync/shared';

export async function getMessages(roomId: string, userId: string, query: {
  page?: number;
  limit?: number;
}) {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: { appointment: { include: { artist: true } } },
  });
  if (!room) throw new AppError(404, 'Chat room not found');

  const isParticipant =
    room.appointment.clientId === userId ||
    room.appointment.artist.userId === userId;
  if (!isParticipant) throw new AppError(403, 'Not authorized');

  const { page, limit, skip } = getPaginationOptions(query);

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { roomId },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.message.count({ where: { roomId } }),
  ]);

  return { messages: messages.reverse(), meta: buildPaginationMeta(total, { page, limit, skip }) };
}

export async function sendMessage(roomId: string, senderId: string, data: {
  content: string;
  type?: string;
}) {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: { appointment: { include: { artist: true } } },
  });
  if (!room) throw new AppError(404, 'Chat room not found');

  const isParticipant =
    room.appointment.clientId === senderId ||
    room.appointment.artist.userId === senderId;
  if (!isParticipant) throw new AppError(403, 'Not authorized');

  return prisma.message.create({
    data: {
      roomId,
      senderId,
      content: data.content,
      type: (data.type as MessageType) ?? MessageType.TEXT,
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  });
}

export async function getRoomByAppointment(appointmentId: string, userId: string) {
  const room = await prisma.chatRoom.findUnique({
    where: { appointmentId },
    include: { appointment: { include: { artist: true } } },
  });
  if (!room) throw new AppError(404, 'Chat room not found');

  const isParticipant =
    room.appointment.clientId === userId ||
    room.appointment.artist.userId === userId;
  if (!isParticipant) throw new AppError(403, 'Not authorized');

  return room;
}
