import { create } from 'zustand';
import { UserRole } from '@inksync/shared';
import * as authService from '../services/authService';

interface User {
  id: string;
  email: string;
  firstName: string;
  role: UserRole;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; role: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const { accessToken } = await authService.getStoredTokens();
      if (!accessToken) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      // Token exists - user is authenticated (will be verified on first API call)
      set({ isLoading: false, isAuthenticated: true });
    } catch {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const result = await authService.login(email, password);
      set({
        user: result.user as User,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const result = await authService.register(data);
      set({
        user: result.user as User,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },
}));
