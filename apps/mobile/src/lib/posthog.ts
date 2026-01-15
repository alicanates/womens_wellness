import PostHog from 'posthog-react-native';

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://app.posthog.com';

let posthogInstance: PostHog | null = null;

export async function initPostHog() {
    if (!POSTHOG_API_KEY || POSTHOG_API_KEY === '__OPTIONAL__') {
        console.log('PostHog API key not configured, skipping initialization');
        return null;
    }

    try {
        posthogInstance = await PostHog.initAsync(POSTHOG_API_KEY, {
            host: POSTHOG_HOST,
            captureApplicationLifecycleEvents: true,
            captureDeepLinks: true,
            enableSessionReplay: false, // Enable if needed
        });

        return posthogInstance;
    } catch (error) {
        console.error('Failed to initialize PostHog:', error);
        return null;
    }
}

export function getPostHog(): PostHog | null {
    return posthogInstance;
}

// Analytics helper functions
export function trackEvent(eventName: string, properties?: Record<string, any>) {
    posthogInstance?.capture(eventName, properties);
}

export function trackScreen(screenName: string, properties?: Record<string, any>) {
    posthogInstance?.screen(screenName, properties);
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
    posthogInstance?.identify(userId, properties);
}

export function resetUser() {
    posthogInstance?.reset();
}

export function setUserProperties(properties: Record<string, any>) {
    posthogInstance?.setPersonProperties(properties);
}

// Common events
export const AnalyticsEvents = {
    // Auth
    LOGIN: 'user_login',
    LOGOUT: 'user_logout',
    SIGNUP: 'user_signup',

    // Onboarding
    ONBOARDING_STARTED: 'onboarding_started',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',

    // Chat
    CHAT_MESSAGE_SENT: 'chat_message_sent',
    CHAT_MESSAGE_RECEIVED: 'chat_message_received',
    CHAT_CONVERSATION_STARTED: 'chat_conversation_started',

    // Subscription
    SUBSCRIPTION_VIEWED: 'subscription_viewed',
    SUBSCRIPTION_PURCHASED: 'subscription_purchased',
    SUBSCRIPTION_CANCELLED: 'subscription_cancelled',

    // Features
    PERIOD_TRACKED: 'period_tracked',
    PREGNANCY_MODE_ENABLED: 'pregnancy_mode_enabled',
    CONTRACTION_TIMER_STARTED: 'contraction_timer_started',
    MEDITATION_STARTED: 'meditation_started',
    ARTICLE_VIEWED: 'article_viewed',

    // Notifications
    NOTIFICATION_PERMISSION_REQUESTED: 'notification_permission_requested',
    NOTIFICATION_PERMISSION_GRANTED: 'notification_permission_granted',
    NOTIFICATION_PERMISSION_DENIED: 'notification_permission_denied',
    NOTIFICATION_RECEIVED: 'notification_received',
    NOTIFICATION_OPENED: 'notification_opened',

    // Errors
    ERROR_OCCURRED: 'error_occurred',
    API_ERROR: 'api_error',
} as const;

export type AnalyticsEvent = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];
