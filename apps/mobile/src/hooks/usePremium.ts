import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { subscriptionService } from '@/services/api';
import { subscriptionSyncService } from '@/services/subscriptionSync';
import type { Subscription, Feature } from '@/types/subscription';
import { isPremiumFeature, canAccessFeature } from '@/types/subscription';

/**
 * Query keys for subscription-related queries
 */
export const subscriptionKeys = {
    all: ['subscription'] as const,
    status: () => [...subscriptionKeys.all, 'status'] as const,
    quota: () => [...subscriptionKeys.all, 'quota'] as const,
    transactions: () => [...subscriptionKeys.all, 'transactions'] as const,
    usageStats: () => [...subscriptionKeys.all, 'usage-stats'] as const,
};

/**
 * Hook to manage premium subscription features
 * 
 * Provides:
 * - Subscription status query
 * - isPremium computed value
 * - canUseFeature method
 * - checkQuota method
 * - incrementQuota method
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */
export function usePremium() {
    const queryClient = useQueryClient();

    // Fetch subscription status
    const {
        data: subscription,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: subscriptionKeys.status(),
        queryFn: () => subscriptionService.getStatus(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    // Computed value: Check if user has premium access
    const isPremium = useMemo(() => {
        if (!subscription) return false;
        return subscription.status === 'ACTIVE' || subscription.status === 'TRIAL';
    }, [subscription]);

    // Check if user can use a specific feature
    const canUseFeature = useCallback(
        (feature: Feature): boolean => {
            if (!subscription) return false;

            // If it's not a premium feature, allow access
            if (!isPremiumFeature(feature)) {
                return true;
            }

            // Check if user has premium access
            return canAccessFeature(feature, subscription);
        },
        [subscription]
    );

    // Check if user has remaining quota
    const checkQuota = useCallback(async (): Promise<boolean> => {
        try {
            const quota = await subscriptionService.getQuota();
            return quota.remaining > 0;
        } catch (error) {
            console.error('Failed to check quota:', error);
            return false;
        }
    }, []);

    // Increment message usage quota
    const incrementQuotaMutation = useMutation({
        mutationFn: () => subscriptionService.incrementQuota(),
        onSuccess: (updatedQuota) => {
            // Update quota cache
            queryClient.setQueryData(subscriptionKeys.quota(), updatedQuota);

            // Invalidate subscription status to get updated usage
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
        },
        onError: (error) => {
            console.error('Failed to increment quota:', error);
        },
    });

    const incrementQuota = useCallback(async () => {
        return incrementQuotaMutation.mutateAsync();
    }, [incrementQuotaMutation]);

    // Force sync subscription from server
    // Requirement 14.2: WHEN kullanıcı farklı cihazda oturum açtığında, 
    //                   THE System SHALL abonelik durumunu senkronize eder
    const syncSubscription = useCallback(async () => {
        console.log('[usePremium] Forcing subscription sync...');
        const freshSubscription = await subscriptionSyncService.forceSyncSubscriptionStatus();
        if (freshSubscription) {
            // Refetch to update local state
            await refetch();
        }
        return freshSubscription;
    }, [refetch]);

    return {
        // Subscription data
        subscription,
        isLoading,
        error,
        refetch,

        // Computed values
        isPremium,

        // Feature access
        canUseFeature,

        // Quota management
        checkQuota,
        incrementQuota,

        // Sync
        syncSubscription,
    };
}

/**
 * Hook to fetch and manage AI message quota
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */
export function useQuota() {
    const queryClient = useQueryClient();

    const {
        data: quota,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: subscriptionKeys.quota(),
        queryFn: () => subscriptionService.getQuota(),
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });

    // Check if quota is running low (< 20%)
    const isLow = useMemo(() => {
        if (!quota) return false;
        return quota.percentage >= 80; // 80% used = 20% remaining
    }, [quota]);

    // Check if quota is depleted
    const isDepleted = useMemo(() => {
        if (!quota) return false;
        return quota.remaining <= 0;
    }, [quota]);

    // Increment quota mutation
    const incrementMutation = useMutation({
        mutationFn: () => subscriptionService.incrementQuota(),
        onSuccess: (updatedQuota) => {
            queryClient.setQueryData(subscriptionKeys.quota(), updatedQuota);
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.status() });
        },
    });

    return {
        quota,
        isLoading,
        error,
        refetch,
        isLow,
        isDepleted,
        increment: incrementMutation.mutateAsync,
    };
}

/**
 * Hook to fetch subscription transactions
 * 
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6
 */
export function useTransactions() {
    return useQuery({
        queryKey: subscriptionKeys.transactions(),
        queryFn: () => subscriptionService.getTransactions(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook to fetch usage statistics
 * 
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
 */
export function useUsageStats() {
    return useQuery({
        queryKey: subscriptionKeys.usageStats(),
        queryFn: () => subscriptionService.getUsageStats(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}
