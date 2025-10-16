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
        // Refresh failed, clear auth and cache to prevent data leakage
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
        // Clear auth state in store
        useAuthStore.setState({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
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
    username: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string; // ISO date string
  }) => api.post<AuthResponse>('/auth/register', data, false),

  login: (data: { identifier: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data, false),

  googleLogin: (idToken: string) =>
    api.post<AuthResponse>('/auth/google', { idToken }, false),

  forgotPassword: (data: { email: string }) =>
    api.post<{ message: string }>('/auth/forgot-password', data, false),

  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post<{ message: string }>('/auth/reset-password', data, false),

  verifyResetToken: (token: string) =>
    api.get<{ isValid: boolean }>(`/auth/verify-reset-token?token=${token}`, false),
};

// User endpoints
export const userService = {
  getMe: () => api.get('/me'),
  updateMe: (data: any) => api.patch('/me', data),
  updateUsername: (username: string) => api.patch('/me/username', { username }),
  checkUsernameAvailability: (username: string) => api.get(`/users/check-username?username=${encodeURIComponent(username)}`, false),
  deleteMe: () => api.delete('/me'),
  exportMyData: () => api.get('/me/export'),

  uploadProfilePicture: async (fileUri: string): Promise<{ profilePictureUrl: string }> => {
    const token = await SecureStore.getItemAsync('accessToken');

    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Create form data
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: fileUri,
      name: filename,
      type,
    } as any);

    // Upload with multipart/form-data
    // Note: Don't set Content-Type header - it will be set automatically with boundary
    const response = await fetch(`${API_BASE_URL}/me/profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.message || error.error || `Upload failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // PIN Management
  getPinStatus: () => api.get<{ pinEnabled: boolean }>('/me/pin-status'),

  setupPin: (pin: string) =>
    api.post<{ success: boolean; message: string }>('/me/pin/setup', { pin }),

  verifyPin: (pin: string) =>
    api.post<{ success: boolean; message: string }>('/me/pin/verify', { pin }),

  disablePin: (pin: string) =>
    api.post<{ success: boolean; message: string }>('/me/pin/disable', { pin }),

  changePin: (oldPin: string, newPin: string) =>
    api.patch<{ success: boolean; message: string }>('/me/pin/change', { oldPin, newPin }),
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

  // Daily Log endpoints
  upsertDailyLog: (data: {
    date: string;
    flow?: 'light' | 'moderate' | 'heavy';
    cramps?: number;
    symptoms?: string[];
    mood?: string[];
    hadSex?: boolean;
    contraception?: string[];
    sexNotes?: string;
    medications?: string[];
    healthNotes?: string;
    attachments?: string[];
  }) => api.post('/cycles/daily-log', data),

  getDailyLog: (date: string) => api.get(`/cycles/daily-log/${date}`),

  getDailyLogs: (startDate: string, endDate: string) =>
    api.get(`/cycles/daily-logs?startDate=${startDate}&endDate=${endDate}`),

  deleteDailyLog: (date: string) => api.delete(`/cycles/daily-log/${date}`),
};

// Pregnancy endpoints
export const pregnancyService = {
  // Pregnancy Profile
  createOrUpdate: (data: {
    lmpDate?: string;
    dueDate?: string;
    doctorNotes?: string;
    isActive?: boolean;
    anonymousMode?: boolean;
  }) => api.post('/pregnancy', data),

  get: () => api.get('/pregnancy'),

  getSummary: () => api.get<{
    gestationalAge: { weeks: number; days: number };
    trimester: number;
    dueDate: string;
    weeklyTip?: string;
  }>('/pregnancy/summary'),

  delete: () => api.delete('/pregnancy'),

  // Kick Counter
  logKick: (data: {
    sessionDate: string;
    kickCount: number;
    durationMin: number;
    notes?: string;
  }) => api.post('/pregnancy/kicks', data),

  getKicks: (limit?: number) =>
    api.get(`/pregnancy/kicks${limit ? `?limit=${limit}` : ''}`),

  deleteKick: (id: string) => api.delete(`/pregnancy/kicks/${id}`),

  // Contractions
  logContraction: (data: {
    startTime: string;
    endTime: string;
    durationSec: number;
    intensity?: number;
    notes?: string;
  }) => api.post('/pregnancy/contractions', data),

  getContractions: (hours?: number) =>
    api.get(`/pregnancy/contractions${hours ? `?hours=${hours}` : ''}`),

  getContractionsSummary: () => api.get('/pregnancy/contractions/summary'),

  deleteContraction: (id: string) => api.delete(`/pregnancy/contractions/${id}`),

  deleteAllContractions: () => api.delete('/pregnancy/contractions'),

  // Appointments
  createAppointment: (data: {
    appointmentAt: string;
    clinic?: string;
    doctorName?: string;
    notes?: string;
    vitals?: any;
  }) => api.post('/pregnancy/appointments', data),

  getAppointments: () => api.get('/pregnancy/appointments'),

  getAppointment: (id: string) => api.get(`/pregnancy/appointments/${id}`),

  updateAppointment: (id: string, data: any) =>
    api.patch(`/pregnancy/appointments/${id}`, data),

  deleteAppointment: (id: string) => api.delete(`/pregnancy/appointments/${id}`),

  // Medications
  addMedication: (data: {
    name: string;
    dosage?: string;
    frequency?: string;
    safetyRating?: string;
    notes?: string;
    startDate?: string;
    endDate?: string;
  }) => api.post('/pregnancy/medications', data),

  getMedications: () => api.get('/pregnancy/medications'),

  updateMedication: (id: string, data: any) =>
    api.patch(`/pregnancy/medications/${id}`, data),

  deleteMedication: (id: string) => api.delete(`/pregnancy/medications/${id}`),

  // Birth Plan
  createOrUpdateBirthPlan: (content: any) =>
    api.post('/pregnancy/birth-plan', { content }),

  getBirthPlan: () => api.get('/pregnancy/birth-plan'),

  deleteBirthPlan: () => api.delete('/pregnancy/birth-plan'),

  // Hospital Bag
  addHospitalBagItem: (data: {
    category: string;
    itemName: string;
    sortOrder?: number;
  }) => api.post('/pregnancy/hospital-bag', data),

  getHospitalBagItems: () => api.get('/pregnancy/hospital-bag'),

  updateHospitalBagItem: (id: string, data: any) =>
    api.patch(`/pregnancy/hospital-bag/${id}`, data),

  deleteHospitalBagItem: (id: string) => api.delete(`/pregnancy/hospital-bag/${id}`),

  // Notes
  createNote: (data: { title?: string; content: string; tags?: string[] }) =>
    api.post('/pregnancy/notes', data),

  getNotes: () => api.get('/pregnancy/notes'),

  getNote: (id: string) => api.get(`/pregnancy/notes/${id}`),

  updateNote: (id: string, data: any) => api.patch(`/pregnancy/notes/${id}`, data),

  deleteNote: (id: string) => api.delete(`/pregnancy/notes/${id}`),

  // Weekly Content
  getWeeklyContent: () => api.get<{
    week: number;
    content: string;
    developmentSummary?: string;
  }>('/pregnancy/weekly-content'),
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

// Home endpoints
export const homeService = {
  getSnapshot: (locale: string = 'tr') =>
    api.get<{
      user: {
        displayName: string;
        profilePictureUrl?: string;
      };
      streak: {
        current: number;
        longest: number;
        startDate?: string;
      };
      todaySnapshot: {
        cycleDay?: number;
        nextPeriodEstimate?: {
          date: string;
          confidence: 'low' | 'medium' | 'high';
        };
        fertilityWindow?: {
          start: number;
          end: number;
        };
        ovulationEstimate?: string;
        pregnancy?: {
          weeks: number;
          days: number;
          dueDate: string;
        };
        waterProgress: {
          current: number;
          target: number;
          logs: number;
        };
        remindersToday: number;
      };
      wellnessTiles?: {
        steps: {
          today: number;
          goal: number;
          percentage: number;
          source: string;
        } | null;
        meditation: {
          todayMin: number;
          goalMin: number;
          percentage: number;
          sessions: number;
        } | null;
        sleep: {
          lastNightMin: number;
          goalHours: number;
          percentage: number;
          quality?: string;
        } | null;
      };
      priorityCards: Array<{
        id: string;
        type: 'hydration' | 'cycle_insight' | 'symptom_log' | 'medication' | 'reminder' | 'nova_prompt';
        priority: number;
        data: any;
        isDismissed: boolean;
        isPinned: boolean;
      }>;
      educationalArticles: Array<{
        id: string;
        title: string;
        excerpt: string;
        category: string;
        tags: string[];
        imageUrl?: string;
        thumbnailUrl?: string;
        readTimeMin: number;
        publishedAt: string;
        isSaved: boolean;
        isViewed: boolean;
      }>;
    }>(`/home/snapshot?locale=${locale}`),

  dismissCard: (cardId: string, days: number = 7) =>
    api.post('/home/cards/dismiss', { cardId, days }),

  pinCard: (cardId: string) =>
    api.post('/home/cards/pin', { cardId }),

  unpinCard: (cardId: string) =>
    api.post('/home/cards/unpin', { cardId }),

  setVisiblePills: (pillIds: string[]) =>
    api.post('/home/pills/set-visible', { pillIds }),
};

// Wellness endpoints
export const wellnessService = {
  // Steps
  getSteps: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    return api.get(`/wellness/v1/steps${params.toString() ? `?${params.toString()}` : ''}`);
  },

  getTodaySteps: () => api.get('/wellness/v1/steps/today'),

  logSteps: (data: { date: string; count: number; source?: string; isManual?: boolean }) =>
    api.post('/wellness/v1/steps', data),

  deleteSteps: (date: string) => api.delete(`/wellness/v1/steps/${date}`),

  // Meditation
  getMeditation: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    return api.get(`/wellness/v1/meditation${params.toString() ? `?${params.toString()}` : ''}`);
  },

  getTodayMeditation: () => api.get('/wellness/v1/meditation/today'),

  logMeditation: (data: {
    date: string;
    durationMin: number;
    type?: 'breath' | 'guided' | 'custom';
    source?: string;
    isManual?: boolean;
  }) => api.post('/wellness/v1/meditation', data),

  deleteMeditation: (sessionId: string) => api.delete(`/wellness/v1/meditation/${sessionId}`),

  // Sleep
  getSleep: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    return api.get(`/wellness/v1/sleep${params.toString() ? `?${params.toString()}` : ''}`);
  },

  getLastNightSleep: () => api.get('/wellness/v1/sleep/last-night'),

  logSleep: (data: {
    sleepDate: string;
    durationMin: number;
    quality?: 'good' | 'medium' | 'poor';
    source?: string;
    isManual?: boolean;
    notes?: string;
  }) => api.post('/wellness/v1/sleep', data),

  deleteSleep: (date: string) => api.delete(`/wellness/v1/sleep/${date}`),

  // Preferences
  getPreferences: () => api.get<{
    id: string;
    userId: string;
    stepsGoal: number;
    meditationGoalMin: number;
    sleepGoalHours: number;
    tilesEnabled: {
      steps: boolean;
      meditation: boolean;
      sleep: boolean;
      water: boolean;
    };
    notificationsJson: any;
  }>('/wellness/v1/preferences'),

  updatePreferences: (data: {
    stepsGoal?: number;
    meditationGoalMin?: number;
    sleepGoalHours?: number;
    tilesEnabled?: any;
    notificationsJson?: any;
  }) => api.post('/wellness/v1/preferences', data),

  // Summary (for Home screen)
  getSummary: () => api.get<{
    steps: {
      today: number;
      goal: number;
      percentage: number;
      source: string;
    } | null;
    meditation: {
      todayMin: number;
      goalMin: number;
      percentage: number;
      sessions: number;
    } | null;
    sleep: {
      lastNightMin: number;
      goalHours: number;
      percentage: number;
      quality?: string;
    } | null;
  }>('/wellness/v1/summary'),
};

// Discover types
export interface ArticleCardDto {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
  readTimeMin: number;
  publishedAt: string;
  isSaved: boolean;
  isViewed: boolean;
}

export interface ArticleDetailDto extends ArticleCardDto {
  content: string;
  author?: string;
  relatedArticles: ArticleCardDto[];
}

export interface PaginatedArticlesDto {
  articles: ArticleCardDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UserContentPreferencesDto {
  categoryWeights: Record<string, number>;
  favoriteCategories: string[];
  showPregnancyContent: boolean;
  showCycleContent: boolean;
}

export interface UpdatePreferencesDto {
  categoryWeights?: Record<string, number>;
  showPregnancyContent?: boolean;
  showCycleContent?: boolean;
}

// Discover endpoints
export const discoverService = {
  // Get personalized articles for home screen
  getHomeFeed: (locale: string = 'tr', limit: number = 5) =>
    api.get<ArticleCardDto[]>(`/discover/home-feed?locale=${locale}&limit=${limit}`),

  // Get all articles with filters
  getArticles: (params: {
    category?: string;
    search?: string;
    locale?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();
    return api.get<PaginatedArticlesDto>(`/discover/articles${query ? `?${query}` : ''}`);
  },

  // Get single article detail
  getArticle: (id: string, locale: string = 'tr') =>
    api.get<ArticleDetailDto>(`/discover/articles/${id}?locale=${locale}`),

  // Get saved articles
  getSavedArticles: (locale: string = 'tr') =>
    api.get<ArticleCardDto[]>(`/discover/saved?locale=${locale}`),

  // Toggle save/unsave article
  toggleSave: (id: string) =>
    api.post<{ saved: boolean }>(`/discover/articles/${id}/save`),

  // Track article view
  trackView: (id: string, readTimeMs?: number) =>
    api.post<{ success: boolean }>(`/discover/articles/${id}/view`,
      readTimeMs !== undefined ? { readTimeMs } : undefined
    ),

  // Track article share
  trackShare: (id: string) =>
    api.post<{ success: boolean }>(`/discover/articles/${id}/share`),

  // Get user preferences
  getPreferences: () =>
    api.get<UserContentPreferencesDto>('/discover/preferences'),

  // Update user preferences
  updatePreferences: (data: UpdatePreferencesDto) =>
    api.patch<UserContentPreferencesDto>('/discover/preferences', data),
};
