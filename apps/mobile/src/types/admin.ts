/**
 * Admin Panel Types
 */

export interface DashboardStats {
    users: {
        total: number;
        active: number;
        new: number;
        growth: number;
    };
    subscriptions: {
        total: number;
        active: number;
        revenue: number;
        growth: number;
    };
    engagement: {
        dailyActive: number;
        weeklyActive: number;
        monthlyActive: number;
        avgSessionTime: number;
    };
    content: {
        questions: number;
        answers: number;
        articles: number;
        conversations: number;
    };
}

export interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
    }>;
}

export interface BulkOperationResult {
    success: number;
    failed: number;
    errors: string[];
}

export interface UserSearchFilters {
    search?: string;
    status?: string;
    subscriptionStatus?: string;
    createdAfter?: string;
    createdBefore?: string;
    lastLoginAfter?: string;
    lastLoginBefore?: string;
    hasSubscription?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedUsers {
    data: Array<any>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ImpersonationResult {
    user: any;
    impersonationToken: string;
}

export interface SystemHealth {
    status: string;
    database: {
        connected: boolean;
        responseTime: number;
    };
    users: {
        total: number;
        active: number;
    };
    errors: {
        rate: number;
        threshold: number;
    };
    timestamp: string;
}

export interface SystemAlert {
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
}

export interface UserActivity {
    activeUsers: number;
    recentActions: Array<{
        userId: string;
        action: string;
        timestamp: Date;
    }>;
}

/**
 * WebSocket Event Types
 */
export type AdminSocketEvent =
    | 'subscribe:dashboard'
    | 'subscribe:user-activity'
    | 'subscribe:system-metrics'
    | 'dashboard:update'
    | 'user-activity:update'
    | 'system-metrics:update'
    | 'user:new'
    | 'user:update'
    | 'subscription:new'
    | 'system:alert';

export interface AdminSocketData {
    'dashboard:update': DashboardStats;
    'user-activity:update': UserActivity;
    'system-metrics:update': SystemHealth;
    'user:new': any;
    'user:update': any;
    'subscription:new': any;
    'system:alert': SystemAlert;
}
