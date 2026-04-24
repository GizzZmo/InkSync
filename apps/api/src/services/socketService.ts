import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env';

let io: SocketServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
    });

    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketServer(): SocketServer {
  if (!io) throw new Error('Socket server not initialized');
  return io;
}
