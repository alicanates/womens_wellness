// PostHog is optional - only import if available
let posthog: any = null;
try {
    posthog = require('posthog-js');
} catch (e) {
    console.log('PostHog not installed, analytics disabled');
}

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

let initialized = false;

export function initPostHog() {
    if (!posthog) {
        console.log('PostHog not available, skipping initialization');
        return;
    }

    if (!POSTHOG_API_KEY || POSTHOG_API_KEY === '__OPTIONAL__') {
        console.log('PostHog API key not configured, skipping initialization');
        return;
    }

    if (initialized) return;

    try {
        posthog.init(POSTHOG_API_KEY, {
            api_host: POSTHOG_HOST,
            loaded: (posthog: any) => {
                if (process.env.NODE_ENV === 'development') {
                    posthog.debug();
                }
            },
            capture_pageview: true,
            capture_pageleave: true,
        });

        initialized = true;
    } catch (error) {
        console.error('Failed to initialize PostHog:', error);
    }
}

// Analytics helper functions
export function trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!initialized || !posthog) return;
    posthog.capture(eventName, properties);
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
    if (!initialized || !posthog) return;
    posthog.identify(userId, properties);
}

export function resetUser() {
    if (!initialized || !posthog) return;
    posthog.reset();
}

export function setUserProperties(properties: Record<string, any>) {
    if (!initialized || !posthog) return;
    posthog.setPersonProperties(properties);
}

// Common admin events
export const AdminAnalyticsEvents = {
    // Auth
    ADMIN_LOGIN: 'admin_login',
    ADMIN_LOGOUT: 'admin_logout',

    // User Management
    USER_VIEWED: 'admin_user_viewed',
    USER_EDITED: 'admin_user_edited',
    USER_DELETED: 'admin_user_deleted',

    // Content Management
    ARTICLE_CREATED: 'admin_article_created',
    ARTICLE_EDITED: 'admin_article_edited',
    ARTICLE_DELETED: 'admin_article_deleted',
    ARTICLE_PUBLISHED: 'admin_article_published',

    // Notifications
    NOTIFICATION_SENT: 'admin_notification_sent',
    NOTIFICATION_SCHEDULED: 'admin_notification_scheduled',

    // Reports
    REPORT_VIEWED: 'admin_report_viewed',
    REPORT_EXPORTED: 'admin_report_exported',

    // QnA Management
    QNA_REPORT_VIEWED: 'admin_qna_report_viewed',
    QNA_REPORT_RESOLVED: 'admin_qna_report_resolved',
    QNA_REPORT_DISMISSED: 'admin_qna_report_dismissed',
} as const;

export type AdminAnalyticsEvent = typeof AdminAnalyticsEvents[keyof typeof AdminAnalyticsEvents];

export { posthog };
