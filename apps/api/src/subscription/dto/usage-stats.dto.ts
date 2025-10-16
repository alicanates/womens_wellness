export class UsageStatsDto {
    totalMessages: number;
    premiumFeaturesUsed: {
        feature: string;
        count: number;
    }[];
    timeSaved: number; // in minutes
    insightsGenerated: number;
    memberSince: string; // ISO date string
    currentStreak: number; // days
}
