import apiClient from './apiClient';
import { AppointmentStatus } from '@inksync/shared';

export async function getAppointments(params?: { page?: number; status?: AppointmentStatus }) {
  const res = await apiClient.get('/appointments', { params });
  return res.data;
}

export async function getAppointmentById(id: string) {
  const res = await apiClient.get(`/appointments/${id}`);
  return res.data.data;
}

export async function createAppointment(data: {
  artistId: string;
  startTime: string;
  endTime: string;
  serviceType: string;
  description?: string;
  depositAmount?: number;
}) {
  const res = await apiClient.post('/appointments', data);
  return res.data.data;
}

export async function cancelAppointment(id: string, reason?: string) {
  const res = await apiClient.post(`/appointments/${id}/cancel`, { reason });
  return res.data.data;
}

export async function rescheduleAppointment(id: string, data: { startTime: string; endTime: string }) {
  const res = await apiClient.post(`/appointments/${id}/reschedule`, data);
  return res.data.data;
}

export async function getAvailability(artistId: string) {
  const res = await apiClient.get(`/availability/${artistId}`);
  return res.data.data;
}
