export type FunNotificationType =
    | 'STREAK_MILESTONE'
    | 'MOTIVATION'
    | 'ACHIEVEMENT_FUN'
    | 'RANDOM_FUN'
    | 'PERIOD_SUPPORT';

export interface FunNotification {
    id: string;
    type: FunNotificationType;
    titleTr: string;
    titleEn: string;
    messageTr: string;
    messageEn: string;
    emoji: string;
    triggerCondition?: {
        streakDay?: number;
        dataEntryCount?: number;
        isPeriodWeek?: boolean;
        random?: boolean;
    };
}

export interface FunNotificationPreferences {
    enabled: boolean;
    streakNotifications: boolean;
    motivationNotifications: boolean;
    achievementNotifications: boolean;
    randomNotifications: boolean;
    periodSupportNotifications: boolean;
    frequency: 'low' | 'medium' | 'high'; // günde kaç tane
}
