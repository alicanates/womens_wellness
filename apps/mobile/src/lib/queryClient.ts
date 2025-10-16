import { QueryClient } from '@tanstack/react-query';

// Global QueryClient instance to be used throughout the app
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry configuration
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Cache configuration
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      cacheTime: 1000 * 60 * 30, // 30 minutes - keep unused data in cache

      // Refetch configuration
      refetchOnWindowFocus: false, // Don't refetch on window focus (mobile optimization)
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch on component mount if stale

      // Performance optimization
      structuralSharing: true, // Prevent unnecessary re-renders
      keepPreviousData: true, // Keep previous data while fetching new data (better UX)
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
      retryDelay: 1000,
    },
  },
});
