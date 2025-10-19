import { api } from './api';
import type {
    GamificationStats,
    UserAchievement,
    UserInsight,
    AchievementProgress,
} from '../types/gamification';

export const gamificationService = {
    // Get user gamification stats
    async getStats(): Promise<GamificationStats> {
        return api.get<GamificationStats>('/gamification/stats');
    },

    // Get user achievements
    async getAchievements(): Promise<UserAchievement[]> {
        return api.get<UserAchievement[]>('/gamification/achievements');
    },

    // Get achievement progress
    async getAchievementProgress(achievementId: string): Promise<AchievementProgress> {
        return api.get<AchievementProgress>(`/gamification/achievements/${achievementId}/progress`);
    },

    // Check for new achievements
    async checkAchievements(): Promise<UserAchievement[]> {
        return api.post<UserAchievement[]>('/gamification/check-achievements');
    },

    // Get user insights
    async getInsights(): Promise<UserInsight[]> {
        return api.get<UserInsight[]>('/gamification/insights');
    },

    // Mark insight as read
    async markInsightAsRead(insightId: string): Promise<void> {
        await api.post<void>(`/gamification/insights/${insightId}/read`);
    },

    // Generate new insights
    async generateInsights(): Promise<UserInsight[]> {
        return api.post<UserInsight[]>('/gamification/generate-insights');
    },

    // Reset gamification data
    async resetGamification(): Promise<{ message: string }> {
        return api.post<{ message: string }>('/gamification/reset');
    },
};
