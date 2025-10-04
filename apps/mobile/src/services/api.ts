import * as SecureStore from 'expo-secure-store';
import type { AuthResponse, AuthTokens } from '@/types/auth';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true,
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {};

    // Only add Authorization header if needed
    if (includeAuth) {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Only add Content-Type if there's a body
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    // Only attempt token refresh for authenticated endpoints
    if (response.status === 401 && includeAuth) {
      // Token expired, try to refresh
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry request with new token
        const retryHeaders: HeadersInit = {};
        const newToken = await SecureStore.getItemAsync('accessToken');
        if (newToken) {
          retryHeaders['Authorization'] = `Bearer ${newToken}`;
        }
        if (options.body) {
          retryHeaders['Content-Type'] = 'application/json';
        }

        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...retryHeaders,
            ...options.headers,
          },
        });
        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({}));
          throw new Error(error.message || `HTTP ${retryResponse.status}`);
        }
        return retryResponse.json();
      } else {
        // Refresh failed, clear auth
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
        throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, includeAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  async post<T>(endpoint: string, data?: any, includeAuth = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth,
    );
  }

  async patch<T>(endpoint: string, data: any, includeAuth = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      includeAuth,
    );
  }

  async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!refreshToken) return false;

      const response = await this.post<AuthTokens>(
        '/auth/refresh',
        { refreshToken },
        false,
      );

      await SecureStore.setItemAsync('accessToken', response.accessToken);
      await SecureStore.setItemAsync('refreshToken', response.refreshToken);
      useAuthStore.setState((state) => ({
        ...state,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      }));

      return true;
    } catch (error) {
      return false;
    }
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth endpoints
export const authService = {
  register: (data: {
    email: string;
    password: string;
    displayName?: string;
  }) => api.post<AuthResponse>('/auth/register', data, false),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data, false),

  googleLogin: (idToken: string) =>
    api.post<AuthResponse>('/auth/google', { idToken }, false),
};

// User endpoints
export const userService = {
  getMe: () => api.get('/me'),
  updateMe: (data: any) => api.patch('/me', data),
};

// Metrics endpoints
export const metricsService = {
  getMetrics: () => api.get('/metrics'),

  calculateBMI: (data: { heightCm: number; weightKg: number }) =>
    api.post('/metrics/bmi', data),

  calculateBMR: (data: {
    heightCm: number;
    weightKg: number;
    ageYears: number;
    sex: 'male' | 'female';
    activityLevel?: string;
  }) => api.post('/metrics/bmr', data),

  calculateWater: (data: {
    weightKg: number;
    activity?: string;
    climate?: string;
  }) => api.post('/metrics/water/calculate', data),
};

// Water endpoints
export const waterService = {
  getLogs: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return api.get(`/water${query ? `?${query}` : ''}`);
  },

  logWater: (data: { amountMl: number; loggedAt?: string }) =>
    api.post('/water', data),

  getTodayTotal: () => api.get('/water/today'),

  getStats: (days?: number) =>
    api.get(`/water/stats${days ? `?days=${days}` : ''}`),
};

// Chat endpoints
export const chatService = {
  getConversations: () => api.get('/chat/conversations'),

  getHistory: (conversationId: string) =>
    api.get(`/chat/${conversationId}/history`),

  sendMessage: (conversationId: string, content: string) =>
    api.post(`/chat/${conversationId}/message`, { content }),

  forgetConversation: (conversationId: string) =>
    api.post(`/chat/${conversationId}/forget`, {}),

  // SSE streaming handled separately in component
  streamUrl: (conversationId: string) =>
    `${API_BASE_URL}/chat/${conversationId}/stream`,
};

// Quota endpoints
export const quotaService = {
  getStatus: () => api.get('/quota'),
};

// Cycles endpoints
export const cyclesService = {
  getCycles: (limit?: number) =>
    api.get(`/cycles${limit ? `?limit=${limit}` : ''}`),

  getCycle: (id: string) => api.get(`/cycles/${id}`),

  createCycle: (data: {
    startDate: string;
    endDate?: string;
    symptoms?: {
      flow: 'light' | 'moderate' | 'heavy';
      cramps: 0 | 1 | 2 | 3 | 4 | 5;
      mood: string[];
      physical: string[];
      notes?: string;
    };
    notes?: string;
  }) => api.post('/cycles', data),

  updateCycle: (
    id: string,
    data: {
      startDate?: string;
      endDate?: string;
      symptoms?: any;
      notes?: string;
    },
  ) => api.patch(`/cycles/${id}`, data),

  deleteCycle: (id: string) => api.delete(`/cycles/${id}`),

  deleteAllCycles: () => api.delete('/cycles'),

  getPrediction: () => api.get('/cycles/prediction'),

  getCalendar: (year: number, month: number) =>
    api.get(`/cycles/calendar?year=${year}&month=${month}`),

  getStats: () => api.get('/cycles/stats'),
};

// Reminders endpoints
export const remindersService = {
  getReminders: () => api.get('/reminders'),

  getReminder: (id: string) => api.get(`/reminders/${id}`),

  createReminder: (data: {
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
    title: string;
    message: string;
    time: string; // HH:mm format
    days?: number[]; // 0-6 for WEEKLY, 1-31 for MONTHLY
    customCron?: string;
    active?: boolean;
  }) => api.post('/reminders', data),

  updateReminder: (
    id: string,
    data: {
      title?: string;
      message?: string;
      time?: string;
      days?: number[];
      customCron?: string;
      active?: boolean;
    },
  ) => api.patch(`/reminders/${id}`, data),

  deleteReminder: (id: string) => api.delete(`/reminders/${id}`),

  toggleReminder: (id: string, active: boolean) =>
    api.patch(`/reminders/${id}/toggle`, { active }),

  registerPushToken: (pushToken: string) =>
    api.post('/reminders/push/register', { pushToken }),

  testPush: () => api.post('/reminders/push/test', {}),
};
