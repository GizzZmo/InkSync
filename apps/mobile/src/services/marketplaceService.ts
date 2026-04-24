import { apiClient } from './apiClient';
import { TattooStyle } from '@inksync/shared';

export async function getFlashDesigns(params?: { style?: TattooStyle; page?: number; limit?: number }) {
  const res = await apiClient.get('/marketplace', { params });
  return res.data;
}

export async function getFlashDesign(id: string) {
  const res = await apiClient.get(`/marketplace/${id}`);
  return res.data.data;
}

export async function purchaseFlashDesign(id: string) {
  const res = await apiClient.post(`/marketplace/${id}/purchase`);
  return res.data.data;
}

export async function getMyPurchases(params?: { page?: number; limit?: number }) {
  const res = await apiClient.get('/marketplace/purchases/me', { params });
  return res.data;
}
