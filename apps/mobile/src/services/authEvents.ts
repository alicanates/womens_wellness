/**
 * Auth Events Service
 * 
 * Simple event emitter for auth state changes
 * Breaks circular dependency between api.ts and authStore.ts
 */

type AuthEventListener = () => void;

class AuthEventsService {
    private listeners: AuthEventListener[] = [];

    /**
     * Subscribe to auth state changes
     */
    subscribe(listener: AuthEventListener): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * Emit auth state change event
     */
    emit(): void {
        this.listeners.forEach(listener => {
            try {
                listener();
            } catch (error) {
                console.error('[AuthEvents] Error in listener:', error);
            }
        });
    }
}

export const authEvents = new AuthEventsService();
