export interface UserGamification {
    id: string;
    userId: string;
    level: number;
    currentXp: number;
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
    streakFreezeUsed: number;
    streakFreezeLimit: number;
    totalDataEntries: number;
    totalSymptoms: number;
    totalWellnessLogs: number;
    dailyChallengeDate: string | null;
    dailyChallengeJson: any | null;
    createdAt: string;
    updatedAt: string;
}

export interface Achievement {
    id: string;
    key: string;
    nameTr: string;
    nameEn: string;
    descriptionTr: string;
    descriptionEn: string;
    iconUrl: string | null;
    iconEmoji: string | null;
    color: string | null;
    category: AchievementCategory;
    rarity: AchievementRarity;
    requirementJson: any;
    points: number;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface UserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    progress: number;
    isCompleted: boolean;
    completedAt: string | null;
    notificationSent: boolean;
    createdAt: string;
    updatedAt: string;
    achievement: Achievement;
}

export interface UserInsight {
    id: string;
    userId: string;
    titleTr: string;
    titleEn: string | null;
    messageTr: string;
    messageEn: string | null;
    type: string;
    category: string;
    dataJson: any | null;
    isRead: boolean;
    readAt: string | null;
    expiresAt: string | null;
    createdAt: string;
}

export interface GamificationStats {
    level: number;
    currentXp: number;
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
    totalDataEntries: number;
    achievements: number;
    xpNeeded: number;
    xpProgress: number;
    xpTotal: number;
    levelProgress: number;
}

export type AchievementCategory = 'STREAK' | 'DATA_ENTRY' | 'WELLNESS' | 'COMMUNITY' | 'MILESTONE' | 'SPECIAL';
export type AchievementRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface AchievementProgress {
    id: string;
    userId: string;
    achievementId: string;
    progress: number;
    isCompleted: boolean;
    completedAt: string | null;
    achievement: Achievement;
    progressPercentage: number;
    target: number;
}
