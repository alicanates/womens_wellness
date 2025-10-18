import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum QnaNotificationType {
    NEW_ANSWER = 'NEW_ANSWER',
    ANSWER_VOTED = 'ANSWER_VOTED',
    BEST_ANSWER_SELECTED = 'BEST_ANSWER_SELECTED',
    QUESTION_COMMENTED = 'QUESTION_COMMENTED',
    ANSWER_COMMENTED = 'ANSWER_COMMENTED',
    FOLLOWED_QUESTION_ANSWERED = 'FOLLOWED_QUESTION_ANSWERED',
    FOLLOWED_USER_ASKED = 'FOLLOWED_USER_ASKED',
    BADGE_EARNED = 'BADGE_EARNED',
}

interface QnaNotificationPreferences {
    // Individual notification type preferences
    newAnswers: boolean;
    answerVotes: boolean;
    bestAnswerSelected: boolean;
    comments: boolean;
    followedContent: boolean;
    badgesEarned: boolean;

    // Global toggle
    enabled: boolean;

    // Notification delivery preferences
    pushEnabled: boolean;
    inAppEnabled: boolean;

    // Quiet hours
    quietHoursEnabled: boolean;
    quietHoursStart: string; // HH:mm format (e.g., "22:00")
    quietHoursEnd: string; // HH:mm format (e.g., "08:00")
}

interface QnaNotificationStore {
    // Preferences
    preferences: QnaNotificationPreferences;
    setPreferences: (preferences: Partial<QnaNotificationPreferences>) => void;
    resetPreferences: () => void;

    // Individual preference setters (for convenience)
    setNewAnswersEnabled: (enabled: boolean) => void;
    setAnswerVotesEnabled: (enabled: boolean) => void;
    setBestAnswerSelectedEnabled: (enabled: boolean) => void;
    setCommentsEnabled: (enabled: boolean) => void;
    setFollowedContentEnabled: (enabled: boolean) => void;
    setBadgesEarnedEnabled: (enabled: boolean) => void;

    // Global toggles
    setNotificationsEnabled: (enabled: boolean) => void;
    setPushEnabled: (enabled: boolean) => void;
    setInAppEnabled: (enabled: boolean) => void;

    // Quiet hours
    setQuietHoursEnabled: (enabled: boolean) => void;
    setQuietHours: (start: string, end: string) => void;

    // Utility methods
    isNotificationTypeEnabled: (type: QnaNotificationType) => boolean;
    isInQuietHours: () => boolean;
    shouldShowNotification: (type: QnaNotificationType) => boolean;

    // Unread notifications count (local cache)
    unreadCount: number;
    setUnreadCount: (count: number) => void;
    incrementUnreadCount: () => void;
    decrementUnreadCount: () => void;
    clearUnreadCount: () => void;

    // Last notification check timestamp
    lastChecked: string | null;
    setLastChecked: (timestamp: string) => void;
}

const defaultPreferences: QnaNotificationPreferences = {
    newAnswers: true,
    answerVotes: true,
    bestAnswerSelected: true,
    comments: true,
    followedContent: true,
    badgesEarned: true,
    enabled: true,
    pushEnabled: true,
    inAppEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
};

export const useQnaNotificationStore = create<QnaNotificationStore>()(
    persist(
        (set, get) => ({
            // Preferences
            preferences: defaultPreferences,
            setPreferences: (preferences) =>
                set((state) => ({
                    preferences: { ...state.preferences, ...preferences },
                })),
            resetPreferences: () => set({ preferences: defaultPreferences }),

            // Individual preference setters
            setNewAnswersEnabled: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, newAnswers: enabled },
                })),
            setAnswerVotesEnabled: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, answerVotes: enabled },
                })),
            setBestAnswerSelectedEnabled: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, bestAnswerSelected: enabled },
                })),
            setCommentsEnabled: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, comments: enabled },
                })),
            setFollowedContentEnabled: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, followedContent: enabled },
                })),
            setBadgesEarnedEnabled: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, badgesEarned: enabled },
                })),

            // Global toggles
            setNotificationsEnabled: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, enabled },
                })),
            setPushEnabled: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, pushEnabled: enabled },
                })),
            setInAppEnabled: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, inAppEnabled: enabled },
                })),

            // Quiet hours
            setQuietHoursEnabled: (enabled) =>
                set((state) => ({
                    preferences: { ...state.preferences, quietHoursEnabled: enabled },
                })),
            setQuietHours: (start, end) =>
                set((state) => ({
                    preferences: {
                        ...state.preferences,
                        quietHoursStart: start,
                        quietHoursEnd: end,
                    },
                })),

            // Utility methods
            isNotificationTypeEnabled: (type) => {
                const { preferences } = get();
                if (!preferences.enabled) return false;

                switch (type) {
                    case QnaNotificationType.NEW_ANSWER:
                        return preferences.newAnswers;
                    case QnaNotificationType.ANSWER_VOTED:
                        return preferences.answerVotes;
                    case QnaNotificationType.BEST_ANSWER_SELECTED:
                        return preferences.bestAnswerSelected;
                    case QnaNotificationType.QUESTION_COMMENTED:
                    case QnaNotificationType.ANSWER_COMMENTED:
                        return preferences.comments;
                    case QnaNotificationType.FOLLOWED_QUESTION_ANSWERED:
                    case QnaNotificationType.FOLLOWED_USER_ASKED:
                        return preferences.followedContent;
                    case QnaNotificationType.BADGE_EARNED:
                        return preferences.badgesEarned;
                    default:
                        return false;
                }
            },

            isInQuietHours: () => {
                const { preferences } = get();
                if (!preferences.quietHoursEnabled) return false;

                const now = new Date();
                const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                const start = preferences.quietHoursStart;
                const end = preferences.quietHoursEnd;

                // Handle overnight quiet hours (e.g., 22:00 to 08:00)
                if (start > end) {
                    return currentTime >= start || currentTime < end;
                }

                // Handle same-day quiet hours (e.g., 13:00 to 15:00)
                return currentTime >= start && currentTime < end;
            },

            shouldShowNotification: (type) => {
                const { isNotificationTypeEnabled, isInQuietHours } = get();
                return isNotificationTypeEnabled(type) && !isInQuietHours();
            },

            // Unread count
            unreadCount: 0,
            setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
            incrementUnreadCount: () =>
                set((state) => ({ unreadCount: state.unreadCount + 1 })),
            decrementUnreadCount: () =>
                set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
            clearUnreadCount: () => set({ unreadCount: 0 }),

            // Last checked
            lastChecked: null,
            setLastChecked: (timestamp) => set({ lastChecked: timestamp }),
        }),
        {
            name: 'qna-notification-store',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
