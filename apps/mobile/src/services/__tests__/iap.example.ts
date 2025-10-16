/**
 * IAP Manager Usage Examples
 * 
 * Bu dosya IAP Manager'ın nasıl kullanılacağını gösterir.
 * Gerçek test dosyası değil, sadece örnek kullanım senaryolarıdır.
 */

import { iapManager } from '../iap';
import { subscriptionService } from '../api';
import { Alert } from 'react-native';

/**
 * Example 1: Initialize IAP on App Launch
 */
export async function initializeIAPOnAppLaunch() {
    try {
        console.log('Initializing IAP...');
        await iapManager.initialize();
        console.log('IAP initialized successfully');
    } catch (error) {
        console.error('Failed to initialize IAP:', error);
        // IAP initialization failure is not critical
        // App can still function without IAP
    }
}

/**
 * Example 2: Load and Display Products
 */
export async function loadAndDisplayProducts() {
    try {
        // Get products from IAP Manager
        const products = iapManager.getProducts();

        console.log('Available products:');
        products.forEach(product => {
            console.log(`- ${product.title}: ${product.localizedPrice}`);
        });

        // Get specific product
        const monthlyProduct = iapManager.getProduct('monthly');
        const yearlyProduct = iapManager.getProduct('yearly');

        return {
            monthly: monthlyProduct,
            yearly: yearlyProduct,
        };
    } catch (error) {
        console.error('Failed to load products:', error);
        throw error;
    }
}

/**
 * Example 3: Purchase Flow
 */
export async function handlePurchase(tier: 'monthly' | 'yearly') {
    try {
        console.log(`Starting purchase for ${tier}...`);

        // Step 1: Request purchase from store
        const purchase = await iapManager.purchase(tier);

        if (!purchase) {
            throw new Error('Purchase failed - no purchase object returned');
        }

        console.log('Purchase successful, validating with backend...');

        // Step 2: Validate with backend
        await iapManager.validatePurchase(purchase);

        console.log('Purchase validated successfully');

        // Step 3: Update local state
        // This would typically be done through React Query invalidation
        // queryClient.invalidateQueries({ queryKey: ['subscription'] });

        return {
            success: true,
            message: 'Premium aboneliğiniz başarıyla aktif edildi!',
        };
    } catch (error: any) {
        console.error('Purchase failed:', error);

        // Handle specific error cases
        if (error.code === 'E_USER_CANCELLED') {
            return {
                success: false,
                message: 'Satın alma iptal edildi',
                userCancelled: true,
            };
        } else if (error.code === 'E_ALREADY_OWNED') {
            // Try to restore purchases
            return handleRestore();
        } else {
            return {
                success: false,
                message: 'Satın alma başarısız. Lütfen tekrar deneyin.',
                error: error.message,
            };
        }
    }
}

/**
 * Example 4: Restore Purchases
 */
export async function handleRestore() {
    try {
        console.log('Restoring purchases...');

        // Step 1: Get available purchases from store
        const purchases = await iapManager.restorePurchases();

        if (purchases.length === 0) {
            return {
                success: false,
                message: 'Geri yüklenecek satın alma bulunamadı',
            };
        }

        console.log(`Found ${purchases.length} purchases to restore`);

        // Step 2: Validate each purchase with backend
        for (const purchase of purchases) {
            try {
                await iapManager.validatePurchase(purchase);
            } catch (error) {
                console.error('Failed to validate purchase:', error);
                // Continue with other purchases
            }
        }

        console.log('Purchases restored successfully');

        return {
            success: true,
            message: 'Satın almalarınız başarıyla geri yüklendi',
        };
    } catch (error) {
        console.error('Restore failed:', error);
        return {
            success: false,
            message: 'Geri yükleme başarısız. Lütfen tekrar deneyin.',
        };
    }
}

/**
 * Example 5: Check Subscription Status
 */
export async function checkSubscriptionStatus() {
    try {
        const status = await subscriptionService.getStatus();

        console.log('Subscription status:', status);

        const isPremium = status.status === 'ACTIVE' || status.status === 'TRIAL';
        const isInGracePeriod = status.isInGracePeriod;

        return {
            isPremium,
            isInGracePeriod,
            status: status.status,
            tier: status.tier,
            endDate: status.endDate,
            quota: {
                used: status.aiMessagesUsed,
                limit: status.aiMessagesLimit,
                remaining: status.aiMessagesLimit - status.aiMessagesUsed,
            },
        };
    } catch (error) {
        console.error('Failed to check subscription status:', error);
        throw error;
    }
}

/**
 * Example 6: Complete Purchase Flow with UI
 */
export async function completePurchaseFlow(
    tier: 'monthly' | 'yearly',
    onSuccess: () => void,
    onError: (message: string) => void,
) {
    try {
        // Show loading indicator
        console.log('Processing purchase...');

        // Execute purchase
        const result = await handlePurchase(tier);

        if (result.success) {
            // Show success message
            Alert.alert(
                'Başarılı! 🎉',
                result.message,
                [
                    {
                        text: 'Harika!',
                        onPress: onSuccess,
                    },
                ],
            );
        } else if (!result.userCancelled) {
            // Show error message (don't show if user cancelled)
            Alert.alert(
                'Hata',
                result.message,
                [{ text: 'Tamam' }],
            );
            onError(result.message);
        }
    } catch (error: any) {
        Alert.alert(
            'Hata',
            'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
            [{ text: 'Tamam' }],
        );
        onError(error.message);
    }
}

/**
 * Example 7: Cleanup on App Close
 */
export async function cleanupIAPOnAppClose() {
    try {
        console.log('Cleaning up IAP...');
        await iapManager.cleanup();
        console.log('IAP cleanup complete');
    } catch (error) {
        console.error('IAP cleanup failed:', error);
    }
}

/**
 * Example 8: Check IAP Availability
 */
export async function checkIAPAvailability() {
    try {
        const isAvailable = await iapManager.isAvailable();

        if (!isAvailable) {
            console.warn('IAP is not available on this device');
            Alert.alert(
                'Uyarı',
                'Bu cihazda uygulama içi satın alma özelliği kullanılamıyor.',
                [{ text: 'Tamam' }],
            );
        }

        return isAvailable;
    } catch (error) {
        console.error('Failed to check IAP availability:', error);
        return false;
    }
}

/**
 * Example 9: Handle Quota Check Before AI Message
 */
export async function checkQuotaBeforeMessage(isPremium: boolean) {
    if (isPremium) {
        // Premium users have unlimited messages
        return { canSend: true };
    }

    try {
        const quota = await subscriptionService.getQuota();

        if (quota.remaining <= 0) {
            // Show upgrade prompt
            return {
                canSend: false,
                reason: 'quota_exceeded',
                message: 'Aylık mesaj kotanız doldu. Premium\'a geçerek sınırsız mesaj gönderin.',
            };
        }

        if (quota.percentage >= 80) {
            // Show warning
            console.warn(`Quota warning: ${quota.remaining} messages remaining`);
        }

        return { canSend: true, remaining: quota.remaining };
    } catch (error) {
        console.error('Failed to check quota:', error);
        // Allow message on error (fail open)
        return { canSend: true };
    }
}

/**
 * Example 10: Increment Quota After Message
 */
export async function incrementQuotaAfterMessage(isPremium: boolean) {
    if (isPremium) {
        // Premium users don't have quota limits
        return;
    }

    try {
        await subscriptionService.incrementQuota();
        console.log('Quota incremented');
    } catch (error) {
        console.error('Failed to increment quota:', error);
        // Non-critical error, don't throw
    }
}
