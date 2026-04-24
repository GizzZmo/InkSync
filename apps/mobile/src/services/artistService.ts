import apiClient from './apiClient';
import { TattooStyle } from '@inksync/shared';

export async function getArtists(params?: {
  page?: number;
  limit?: number;
  style?: TattooStyle;
  city?: string;
}) {
  const res = await apiClient.get('/artists', { params });
  return res.data;
}

export async function getArtistById(id: string) {
  const res = await apiClient.get(`/artists/${id}`);
  return res.data.data;
}

export async function getArtistPortfolio(artistId: string, params?: { page?: number; style?: TattooStyle }) {
  const res = await apiClient.get(`/artists/${artistId}/portfolio`, { params });
  return res.data;
}

export async function updateArtistProfile(artistId: string, data: Record<string, unknown>) {
  const res = await apiClient.put(`/artists/${artistId}`, data);
  return res.data.data;
}

export async function getPortfolioUploadUrl(artistId: string, mimeType: string) {
  const res = await apiClient.post(`/artists/${artistId}/portfolio/presign`, { mimeType });
  return res.data.data as { uploadUrl: string; s3Key: string; publicUrl: string };
}

export async function addPortfolioImage(artistId: string, data: {
  s3Key: string;
  url: string;
  style: TattooStyle;
  title?: string;
}) {
  const res = await apiClient.post(`/artists/${artistId}/portfolio`, data);
  return res.data.data;
}
