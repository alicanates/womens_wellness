import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Configuration for Performance Optimization
 * 
 * This configuration optimizes:
 * - Cache times (staleTime, gcTime)
 * - Retry logic
 * - Refetch behavior
 * - Network mode handling
 */

export const queryClientConfig = {
    defaultOptions: {
        queries: {
            // Cache Configuration
            staleTime: 2 * 60 * 1000, // 2 minutes - Data considered fresh
            gcTime: 5 * 60 * 1000, // 5 minutes - Garbage collection time (formerly cacheTime)

            // Retry Configuration
            retry: 2, // Retry failed requests 2 times
            retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Refetch Configuration
            refetchOnWindowFocus: false, // Don't refetch on app focus (mobile optimization)
            refetchOnReconnect: true, // Refetch when network reconnects
            refetchOnMount: false, // Don't refetch on component mount if data is fresh

            // Network Mode
            networkMode: 'online' as const, // Only fetch when online
        },
        mutations: {
            // Retry Configuration for Mutations
            retry: 1, // Retry failed mutations once
            retryDelay: 1000,

            // Network Mode
            networkMode: 'online' as const,
        },
    },
};

/**
 * Create a configured QueryClient instance
 */
export function createQueryClient(): QueryClient {
    return new QueryClient(queryClientConfig);
}

/**
 * QnA-specific cache configuration
 * Use these values in QnA hooks for optimal performance
 */
export const qnaCacheConfig = {
    // Questions List
    questionsList: {
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    },

    // Question Detail
    questionDetail: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    },

    // Answers
    answers: {
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    },

    // Comments
    comments: {
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    },

    // User Reputation
    reputation: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    },

    // Leaderboard
    leaderboard: {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
    },

    // Badges
    badges: {
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
    },

    // Quota
    quota: {
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    },

    // Share Links
    shareLinks: {
        staleTime: 60 * 60 * 1000, // 1 hour
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
    },
};

/**
 * Prefetch strategies for better UX
 */
export const prefetchStrategies = {
    // Prefetch question details when hovering/viewing list
    prefetchQuestionOnHover: true,

    // Prefetch next page when user is near the end
    prefetchNextPageThreshold: 0.8, // 80% scrolled

    // Prefetch related questions
    prefetchRelatedQuestions: true,
};
