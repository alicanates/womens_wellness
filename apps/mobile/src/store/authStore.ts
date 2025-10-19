import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { AuthTokens, AuthUser } from '@/types/auth';
import { queryClient } from '@/lib/queryClient';
import { subscriptionSyncService } from '@/services/subscriptionSync';
import { authEvents } from '@/services/authEvents';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUser, tokens: AuthTokens) => Promise<void>;
  clearAuth: () => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user, tokens) => {
    await SecureStore.setItemAsync('accessToken', tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    set({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
    });
  },

  clearAuth: async () => {
    // Clear React Query cache to prevent data leakage between users
    queryClient.clear();
    // Reset subscription sync service
    subscriptionSyncService.reset();
    // Clear secure storage
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('pinVerified'); // Clear PIN verification
    // Clear state
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  logout: async () => {
    // Clear React Query cache to prevent data leakage between users
    queryClient.clear();
    // Reset subscription sync service
    subscriptionSyncService.reset();
    // Clear secure storage
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('pinVerified'); // Clear PIN verification
    // Clear state
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  initialize: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const userStr = await SecureStore.getItemAsync('user');

      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr);

        // Validate token by trying to fetch user data
        try {
          const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';
          const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            // Token is valid, use fresh data from /me endpoint
            const freshUserData = await response.json();
            // Update cached user in SecureStore with fresh data
            await SecureStore.setItemAsync('user', JSON.stringify(freshUserData));
            set({
              user: freshUserData,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token is invalid, clear auth and cache
            queryClient.clear();
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await SecureStore.deleteItemAsync('user');
            await SecureStore.deleteItemAsync('pinVerified');
            set({ isLoading: false, isAuthenticated: false });
          }
        } catch (error) {
          // Network error or API not available, clear auth to be safe
          console.warn('Could not validate token, clearing auth:', error);
          queryClient.clear();
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
          await SecureStore.deleteItemAsync('user');
          await SecureStore.deleteItemAsync('pinVerified');
          set({ isLoading: false, isAuthenticated: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ isLoading: false });
    }

    // Subscribe to auth events from api.ts
    authEvents.subscribe(async () => {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const userStr = await SecureStore.getItemAsync('user');

      if (accessToken && refreshToken && userStr) {
        // Tokens were refreshed
        const user = JSON.parse(userStr);
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      } else {
        // Auth was cleared
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      }
    });
  },
}));
