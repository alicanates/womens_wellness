import { useEffect } from 'react';
import { useQnaNotificationStore, QnaNotificationType } from '@/store/qnaNotificationStore';
import * as Notifications from 'expo-notifications';

/**
 * Hook for managing QnA notification preferences
 */
export function useQnaNotificationPreferences() {
    const {
        preferences,
        setPreferences,
        setNewAnswersEnabled,
        setAnswerVotesEnabled,
        setBestAnswerSelectedEnabled,
        setCommentsEnabled,
        setFollowedContentEnabled,
        setBadgesEarnedEnabled,
        setNotificationsEnabled,
        setPushEnabled,
        setInAppEnabled,
        setQuietHoursEnabled,
        setQuietHours,
        resetPreferences,
    } = useQnaNotificationStore();

    return {
        preferences,
        setPreferences,
        setNewAnswersEnabled,
        setAnswerVotesEnabled,
        setBestAnswerSelectedEnabled,
        setCommentsEnabled,
        setFollowedContentEnabled,
        setBadgesEarnedEnabled,
        setNotificationsEnabled,
        setPushEnabled,
        setInAppEnabled,
        setQuietHoursEnabled,
        setQuietHours,
        resetPreferences,
    };
}

/**
 * Hook for checking if a notification should be shown
 */
export function useQnaNotificationCheck() {
    const { shouldShowNotification, isInQuietHours, isNotificationTypeEnabled } =
        useQnaNotificationStore();

    return {
        shouldShowNotification,
        isInQuietHours,
        isNotificationTypeEnabled,
    };
}

/**
 * Hook for managing unread notification count
 */
export function useQnaUnreadCount() {
    const {
        unreadCount,
        setUnreadCount,
        incrementUnreadCount,
        decrementUnreadCount,
        clearUnreadCount,
    } = useQnaNotificationStore();

    return {
        unreadCount,
        setUnreadCount,
        incrementUnreadCount,
        decrementUnreadCount,
        clearUnreadCount,
    };
}

/**
 * Hook for handling incoming QnA notifications
 * Sets up notification listeners and updates unread count
 */
export function useQnaNotificationListener() {
    const { shouldShowNotification } = useQnaNotificationStore();
    const { incrementUnreadCount } = useQnaUnreadCount();

    useEffect(() => {
        // Listen for notifications received while app is foregrounded
        const subscription = Notifications.addNotificationReceivedListener((notification) => {
            const data = notification.request.content.data;

            // Check if it's a QnA notification
            if (data?.type && Object.values(QnaNotificationType).includes(data.type)) {
                const notificationType = data.type as QnaNotificationType;

                // Check if we should show this notification
                if (shouldShowNotification(notificationType)) {
                    incrementUnreadCount();
                }
            }
        });

        return () => subscription.remove();
    }, [shouldShowNotification, incrementUnreadCount]);
}

/**
 * Hook for handling notification responses (when user taps notification)
 */
export function useQnaNotificationResponse(
    onNotificationPress?: (type: QnaNotificationType, data: any) => void
) {
    const { decrementUnreadCount } = useQnaUnreadCount();

    useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;

            // Check if it's a QnA notification
            if (data?.type && Object.values(QnaNotificationType).includes(data.type)) {
                const notificationType = data.type as QnaNotificationType;

                // Decrement unread count
                decrementUnreadCount();

                // Call custom handler if provided
                if (onNotificationPress) {
                    onNotificationPress(notificationType, data);
                }
            }
        });

        return () => subscription.remove();
    }, [onNotificationPress, decrementUnreadCount]);
}

/**
 * Hook for scheduling local notifications (for testing)
 */
export function useScheduleQnaNotification() {
    const { shouldShowNotification } = useQnaNotificationStore();

    const scheduleNotification = async (
        type: QnaNotificationType,
        title: string,
        body: string,
        data?: any
    ) => {
        // Check if we should show this notification
        if (!shouldShowNotification(type)) {
            return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: {
                    type,
                    ...data,
                },
            },
            trigger: null, // Show immediately
        });
    };

    return { scheduleNotification };
}

/**
 * Hook for getting notification settings summary
 */
export function useQnaNotificationSummary() {
    const { preferences } = useQnaNotificationStore();

    const enabledCount = [
        preferences.newAnswers,
        preferences.answerVotes,
        preferences.bestAnswerSelected,
        preferences.comments,
        preferences.followedContent,
        preferences.badgesEarned,
    ].filter(Boolean).length;

    const totalCount = 6;

    return {
        enabledCount,
        totalCount,
        allEnabled: enabledCount === totalCount,
        noneEnabled: enabledCount === 0,
        someEnabled: enabledCount > 0 && enabledCount < totalCount,
    };
}

/**
 * Hook for quiet hours validation
 */
export function useQuietHoursValidation() {
    const validateTimeFormat = (time: string): boolean => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    };

    const parseTime = (time: string): { hours: number; minutes: number } | null => {
        if (!validateTimeFormat(time)) return null;

        const [hours, minutes] = time.split(':').map(Number);
        return { hours, minutes };
    };

    const formatTime = (hours: number, minutes: number): string => {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    return {
        validateTimeFormat,
        parseTime,
        formatTime,
    };
}
