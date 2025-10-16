/**
 * Subscription Sync Service
 * 
 * Handles multi-device synchronization of subscription status
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */

import { queryClient } from '@/lib/queryClient';
import { subscriptionService } from './api';
import { subscriptionKeys } from '@/hooks/usePremium';
import type { Subscription } from '@/types/subscription';

class SubscriptionSyncService {
    private syncInProgress = false;
    private lastSyncTime: number | null = null;
    private readonly SYNC_COOLDOWN = 30000; // 30 seconds cooldown between syncs

    /**
     * Sync subscription status from server
     * Called on app start and when subscription changes are detected
     * 
     * Requirement 14.1: THE System SHALL abonelik durumunu sunucuda saklar
     * Requirement 14.2: WHEN kullanıcı farklı cihazda oturum açtığında, 
     *                   THE System SHALL abonelik durumunu senkronize eder
     */
    async syncSubscriptionStatus(): Promise<Subscription | null> {
        // Prevent concurrent syncs
        if (this.syncInProgress) {
            console.log('[SubscriptionSync] Sync already in progress, skipping');
            return null;
        }

        // Check cooldown to prevent excessive API calls
        if (this.lastSyncTime && Date.now() - this.lastSyncTime < this.SYNC_COOLDOWN) {
            console.log('[SubscriptionSync] Sync cooldown active, skipping');
            return null;
        }

        try {
            this.syncInProgress = true;
            console.log('[SubscriptionSync] Starting subscription sync...');

            // Fetch fresh subscription data from server
            const subscription = await subscriptionService.getStatus();

            // Update cache with fresh data
            queryClient.setQueryData(subscriptionKeys.status(), subscription);

            // Also invalidate related queries to ensure consistency
            await this.invalidateSubscriptionCache();

            this.lastSyncTime = Date.now();
            console.log('[SubscriptionSync] Sync completed successfully', {
                status: subscription.status,
                tier: subscription.tier,
            });

            return subscription;
        } catch (error) {
            console.error('[SubscriptionSync] Sync failed:', error);
            return null;
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Invalidate all subscription-related cache
     * Forces refetch of subscription data across all screens
     * 
     * Requirement 14.5: WHEN abonelik durumu değiştiğinde, 
     *                   THE System SHALL tüm cihazları günceller
     */
    async invalidateSubscriptionCache(): Promise<void> {
        console.log('[SubscriptionSync] Invalidating subscription cache...');

        // Invalidate all subscription queries
        await queryClient.invalidateQueries({
            queryKey: subscriptionKeys.all,
        });

        // Invalidate quota separately to ensure it's refreshed
        await queryClient.invalidateQueries({
            queryKey: subscriptionKeys.quota(),
        });

        // Invalidate home snapshot which includes subscription-dependent data
        await queryClient.invalidateQueries({
            queryKey: ['home', 'snapshot'],
        });

        console.log('[SubscriptionSync] Cache invalidation complete');
    }

    /**
     * Handle subscription change event
     * Called when a subscription change is detected (purchase, cancellation, etc.)
     * 
     * Requirement 14.2: WHEN kullanıcı farklı cihazda oturum açtığında, 
     *                   THE System SHALL abonelik durumunu senkronize eder
     * Requirement 14.5: WHEN abonelik durumu değiştiğinde, 
     *                   THE System SHALL tüm cihazları günceller
     */
    async handleSubscriptionChange(): Promise<void> {
        console.log('[SubscriptionSync] Subscription change detected, syncing...');

        // Clear cooldown to allow immediate sync on subscription changes
        this.lastSyncTime = null;

        // Sync subscription status
        await this.syncSubscriptionStatus();

        // Notify that subscription has changed
        this.notifySubscriptionChange();
    }

    /**
     * Notify all components that subscription has changed
     * This triggers re-renders across the app
     */
    private notifySubscriptionChange(): void {
        // React Query will automatically notify all components
        // that are using subscription queries when cache is invalidated
        console.log('[SubscriptionSync] Subscription change notification sent');
    }

    /**
     * Check if subscription needs sync
     * Used to determine if we should sync on app foreground
     */
    shouldSync(): boolean {
        if (this.syncInProgress) return false;
        if (!this.lastSyncTime) return true;
        return Date.now() - this.lastSyncTime > this.SYNC_COOLDOWN;
    }

    /**
     * Force sync regardless of cooldown
     * Used for critical operations like purchase completion
     */
    async forceSyncSubscriptionStatus(): Promise<Subscription | null> {
        this.lastSyncTime = null; // Clear cooldown
        return this.syncSubscriptionStatus();
    }

    /**
     * Reset sync state
     * Called on logout to clean up
     */
    reset(): void {
        this.syncInProgress = false;
        this.lastSyncTime = null;
        console.log('[SubscriptionSync] Sync state reset');
    }
}

// Export singleton instance
export const subscriptionSyncService = new SubscriptionSyncService();
