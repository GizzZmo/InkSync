import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { TokenPayload } from '@inksync/shared';

let io: SocketServer;

export function initSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as TokenPayload;
    console.log(`Socket connected: ${user.userId}`);

    socket.on('join_room', async (roomId: string) => {
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        include: {
          appointment: {
            include: { artist: true },
          },
        },
      });

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const isParticipant =
        room.appointment.clientId === user.userId ||
        room.appointment.artist.userId === user.userId;

      if (!isParticipant) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      socket.join(roomId);
      socket.emit('joined_room', { roomId });
    });

    socket.on('send_message', async (data: { roomId: string; content: string; type?: string }) => {
      try {
        const message = await prisma.message.create({
          data: {
            roomId: data.roomId,
            senderId: user.userId,
            content: data.content,
            type: (data.type as any) ?? 'TEXT',
          },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        });

        io.to(data.roomId).emit('new_message', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('mark_read', async (messageId: string) => {
      await prisma.message.update({
        where: { id: messageId },
        data: { readAt: new Date() },
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${user.userId}`);
    });
  });

  console.log('✅ Socket.IO server initialized');
  return io;
}

export function getSocketServer(): SocketServer {
  if (!io) throw new Error('Socket server not initialized');
  return io;
}
