import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FunNotificationPreferences } from '@/types/funNotifications';

interface FunNotificationStore {
    preferences: FunNotificationPreferences;
    lastShownNotifications: Record<string, string>; // notificationId -> timestamp

    // Preferences
    setPreferences: (preferences: Partial<FunNotificationPreferences>) => void;
    resetPreferences: () => void;

    // Toggles
    setEnabled: (enabled: boolean) => void;
    setStreakNotifications: (enabled: boolean) => void;
    setMotivationNotifications: (enabled: boolean) => void;
    setAchievementNotifications: (enabled: boolean) => void;
    setRandomNotifications: (enabled: boolean) => void;
    setPeriodSupportNotifications: (enabled: boolean) => void;
    setFrequency: (frequency: 'low' | 'medium' | 'high') => void;

    // Tracking
    markNotificationShown: (notificationId: string) => void;
    canShowNotification: (notificationId: string, cooldownHours?: number) => boolean;
}

const defaultPreferences: FunNotificationPreferences = {
    enabled: true,
    streakNotifications: true,
    motivationNotifications: true,
    achievementNotifications: true,
    randomNotifications: true,
    periodSupportNotifications: true,
    frequency: 'medium' // low: 1/gün, medium: 2-3/gün, high: 4-5/gün
};

export const useFunNotificationStore = create<FunNotificationStore>()(
    persist(
        (set, get) => ({
            preferences: defaultPreferences,
            lastShownNotifications: {},

            setPreferences: (preferences) =>
                set((state) => ({
                    preferences: { ...state.preferences, ...preferences }
                })),

            resetPreferences: () =>
                set({
                    preferences: defaultPreferences,
                    lastShownNotifications: {}
                }),

            setEnabled: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, enabled }
                })),

            setStreakNotifications: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, streakNotifications: enabled }
                })),

            setMotivationNotifications: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, motivationNotifications: enabled }
                })),

            setAchievementNotifications: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, achievementNotifications: enabled }
                })),

            setRandomNotifications: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, randomNotifications: enabled }
                })),

            setPeriodSupportNotifications: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, periodSupportNotifications: enabled }
                })),

            setFrequency: (frequency) =>
                set((state) => ({
                    preferences: { ...state.preferences, frequency }
                })),

            markNotificationShown: (notificationId) =>
                set((state) => ({
                    lastShownNotifications: {
                        ...state.lastShownNotifications,
                        [notificationId]: new Date().toISOString()
                    }
                })),

            canShowNotification: (notificationId, cooldownHours = 24) => {
                const { lastShownNotifications } = get();
                const lastShown = lastShownNotifications[notificationId];

                if (!lastShown) return true;

                const lastShownDate = new Date(lastShown);
                const now = new Date();
                const hoursSinceLastShown = (now.getTime() - lastShownDate.getTime()) / (1000 * 60 * 60);

                return hoursSinceLastShown >= cooldownHours;
            }
        }),
        {
            name: 'fun-notification-store',
            storage: createJSONStorage(() => AsyncStorage)
        }
    )
);
