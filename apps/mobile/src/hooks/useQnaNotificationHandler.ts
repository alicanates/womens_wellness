import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

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

interface QnaNotificationData {
    type: 'qna';
    notificationType: QnaNotificationType;
    questionId?: string;
    answerId?: string;
    commentId?: string;
    userId?: string;
    badgeId?: string;
}

/**
 * Hook for handling QnA notifications
 * Manages deep linking and navigation for QnA-related notifications
 */
export function useQnaNotificationHandler() {
    const router = useRouter();
    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    /**
     * Handle notification received while app is in foreground
     */
    const handleNotificationReceived = (notification: Notifications.Notification) => {
        const data = notification.request.content.data as QnaNotificationData;

        if (data.type === 'qna') {
            console.log('[QnA Notification] Received:', data.notificationType);
            // Show in-app notification banner (handled by Expo)
        }
    };

    /**
     * Handle notification tap (deep linking)
     */
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
        const data = response.notification.request.content.data as QnaNotificationData;

        if (data.type !== 'qna') {
            return; // Not a QnA notification
        }

        console.log('[QnA Notification] Tapped:', data.notificationType);
        navigateToQnaContent(data);
    };

    /**
     * Navigate to appropriate QnA screen based on notification data
     */
    const navigateToQnaContent = (data: QnaNotificationData) => {
        switch (data.notificationType) {
            case QnaNotificationType.NEW_ANSWER:
            case QnaNotificationType.QUESTION_COMMENTED:
            case QnaNotificationType.FOLLOWED_QUESTION_ANSWERED:
                // Navigate to question detail
                if (data.questionId) {
                    router.push(`/(tabs)/community/${data.questionId}`);
                }
                break;

            case QnaNotificationType.ANSWER_VOTED:
            case QnaNotificationType.BEST_ANSWER_SELECTED:
            case QnaNotificationType.ANSWER_COMMENTED:
                // Navigate to question detail (answer is within question)
                if (data.questionId) {
                    router.push(`/(tabs)/community/${data.questionId}`);
                }
                break;

            case QnaNotificationType.FOLLOWED_USER_ASKED:
                // Navigate to question detail
                if (data.questionId) {
                    router.push(`/(tabs)/community/${data.questionId}`);
                }
                break;

            case QnaNotificationType.BADGE_EARNED:
                // Navigate to user's profile/reputation page
                router.push('/(tabs)/community/my-questions');
                break;

            default:
                // Default to community home
                router.push('/(tabs)/community');
                break;
        }
    };

    /**
     * Setup notification listeners
     */
    useEffect(() => {
        // Listener for notifications received while app is in foreground
        notificationListener.current = Notifications.addNotificationReceivedListener(
            handleNotificationReceived
        );

        // Listener for user tapping on notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            handleNotificationResponse
        );

        // Cleanup listeners on unmount
        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    return {
        navigateToQnaContent,
    };
}
