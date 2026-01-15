import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.SENTRY_DSN;

export function initSentry() {
    if (!SENTRY_DSN || SENTRY_DSN === '__OPTIONAL__') {
        console.log('Sentry DSN not configured, skipping initialization');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,

        // Environment
        environment: __DEV__ ? 'development' : 'production',

        // Release tracking
        release: '1.0.0',
        dist: '1',

        // Performance Monitoring
        tracesSampleRate: __DEV__ ? 1.0 : 0.2,
        enableAutoSessionTracking: true,
        sessionTrackingIntervalMillis: 30000,

        // Profiling
        profilesSampleRate: __DEV__ ? 1.0 : 0.1,

        // Debug
        debug: __DEV__,

        // Integrations
        integrations: [
            new Sentry.ReactNativeTracing({
                routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
                enableNativeFramesTracking: !__DEV__,
            }),
        ],

        // Before send hook - filter sensitive data
        beforeSend(event, hint) {
            // Remove sensitive data
            if (event.request) {
                delete event.request.cookies;

                // Filter sensitive headers
                if (event.request.headers) {
                    delete event.request.headers.Authorization;
                    delete event.request.headers.Cookie;
                }
            }

            // Filter sensitive user data
            if (event.user) {
                delete event.user.email;
                delete event.user.ip_address;
            }

            return event;
        },

        // Ignore specific errors
        ignoreErrors: [
            // Network errors
            'Network request failed',
            'Network Error',
            'Failed to fetch',

            // Cancelled requests
            'AbortError',
            'Request aborted',

            // Common React Native errors
            'Invariant Violation',

            // User cancelled actions
            'User cancelled',
            'User denied',
        ],
    });
}

// Helper functions
export function captureException(error: Error, context?: Record<string, any>) {
    if (context) {
        Sentry.setContext('additional', context);
    }
    Sentry.captureException(error);
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    Sentry.captureMessage(message, level);
}

export function setUser(user: { id: string; username?: string }) {
    Sentry.setUser({
        id: user.id,
        username: user.username,
    });
}

export function clearUser() {
    Sentry.setUser(null);
}

export function addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: Sentry.SeverityLevel;
    data?: Record<string, any>;
}) {
    Sentry.addBreadcrumb(breadcrumb);
}

export { Sentry };
