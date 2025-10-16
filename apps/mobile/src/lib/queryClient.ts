import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance to be used throughout the app
 * 
 * Cache Invalidation Strategy for Multi-Device Sync:
 * - Subscription queries: 5 min stale time, refetch on mount if stale
 * - Quota queries: 2 min stale time (more frequent updates needed)
 * - On subscription change: invalidate all subscription-related queries
 * - On app foreground: sync if last sync > 30 seconds ago
 * - On purchase/restore: force immediate sync
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry configuration
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Cache configuration
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 30, // 30 minutes - keep unused data in cache (formerly cacheTime)

      // Refetch configuration
      refetchOnWindowFocus: false, // Don't refetch on window focus (mobile optimization)
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch on component mount if stale

      // Performance optimization
      structuralSharing: true, // Prevent unnecessary re-renders
      // Note: keepPreviousData is deprecated in v5, use placeholderData instead if needed
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
      retryDelay: 1000,
    },
  },
});
