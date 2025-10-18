import { api } from './api';

export interface QnaNotificationPreferences {
    newAnswers: boolean;
    answerVotes: boolean;
    bestAnswerSelected: boolean;
    comments: boolean;
    followedContent: boolean;
    badgesEarned: boolean;
}

/**
 * QnA Notification Service
 * Manages notification preferences for Q&A community features
 */
export const qnaNotificationService = {
    /**
     * Get user's QnA notification preferences
     */
    getPreferences: async (): Promise<QnaNotificationPreferences> => {
        return api.get<QnaNotificationPreferences>('/qna/notifications/preferences');
    },

    /**
     * Update user's QnA notification preferences
     */
    updatePreferences: async (
        preferences: Partial<QnaNotificationPreferences>
    ): Promise<QnaNotificationPreferences> => {
        return api.patch<QnaNotificationPreferences>(
            '/qna/notifications/preferences',
            preferences
        );
    },
};
