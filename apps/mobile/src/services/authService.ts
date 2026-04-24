import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';

export interface LoginResponse {
  user: { id: string; email: string; role: string; firstName: string };
  tokens: { accessToken: string; refreshToken: string; expiresIn: number };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post('/auth/login', { email, password });
  const { user, tokens } = res.data.data as LoginResponse;
  await AsyncStorage.setItem('accessToken', tokens.accessToken);
  await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
  return { user, tokens };
}

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}): Promise<LoginResponse> {
  const res = await apiClient.post('/auth/register', data);
  const { user, tokens } = res.data.data as LoginResponse;
  await AsyncStorage.setItem('accessToken', tokens.accessToken);
  await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
  return { user, tokens };
}

export async function logout(): Promise<void> {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (refreshToken) {
    await apiClient.post('/auth/logout', { refreshToken }).catch(() => {});
  }
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, password });
}

export async function getStoredTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  const [accessToken, refreshToken] = await AsyncStorage.multiGet(['accessToken', 'refreshToken']);
  return {
    accessToken: accessToken[1],
    refreshToken: refreshToken[1],
  };
}
