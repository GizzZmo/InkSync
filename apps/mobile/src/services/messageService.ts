import apiClient from './apiClient';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

let socket: Socket | null = null;

export async function connectSocket(): Promise<Socket> {
  const token = await AsyncStorage.getItem('accessToken');
  socket = io(process.env.API_URL ?? 'http://localhost:3000', {
    auth: { token },
    transports: ['websocket'],
  });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

export async function getMessages(roomId: string, params?: { page?: number }) {
  const res = await apiClient.get(`/messages/${roomId}`, { params });
  return res.data;
}

export async function sendMessage(roomId: string, content: string) {
  const res = await apiClient.post(`/messages/${roomId}`, { content });
  return res.data.data;
}

export async function getChatRoomByAppointment(appointmentId: string) {
  const res = await apiClient.get(`/messages/appointment/${appointmentId}`);
  return res.data.data;
}
