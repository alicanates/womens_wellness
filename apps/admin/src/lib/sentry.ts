import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function initSentry() {
    if (!SENTRY_DSN || SENTRY_DSN === '__OPTIONAL__') {
        console.log('Sentry DSN not configured, skipping initialization');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,

        // Environment
        environment: process.env.NODE_ENV,

        // Performance Monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Session Replay
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        // Debug
        debug: process.env.NODE_ENV === 'development',

        // Before send hook
        beforeSend(event) {
            // Filter sensitive data
            if (event.request) {
                delete event.request.cookies;

                if (event.request.headers) {
                    delete event.request.headers.authorization;
                    delete event.request.headers.cookie;
                }
            }

            if (event.user) {
                delete event.user.email;
                delete event.user.ip_address;
            }

            return event;
        },
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

export function setUser(user: { id: string; email?: string }) {
    Sentry.setUser({
        id: user.id,
        // Don't include email for privacy
    });
}

export function clearUser() {
    Sentry.setUser(null);
}
