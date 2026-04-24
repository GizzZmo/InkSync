import apiClient from './apiClient';

export async function createDeposit(data: { appointmentId: string; amount: number }) {
  const res = await apiClient.post('/payments/deposit', data);
  return res.data.data as { payment: unknown; clientSecret: string };
}

export async function getArtistPayments(artistId: string, params?: { page?: number }) {
  const res = await apiClient.get(`/payments/artist/${artistId}`, { params });
  return res.data;
}
