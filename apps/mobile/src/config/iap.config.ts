/**
 * In-App Purchase Configuration
 * 
 * Product IDs for iOS App Store and Google Play Store
 * These IDs must match the products configured in:
 * - App Store Connect (iOS)
 * - Google Play Console (Android)
 */

export const IAP_CONFIG = {
    // iOS Product IDs (App Store Connect)
    ios: {
        monthly: 'com.wellness.companion.premium.monthly',
        yearly: 'com.wellness.companion.premium.yearly',
    },

    // Android Product IDs (Google Play Console)
    android: {
        monthly: 'premium_monthly',
        yearly: 'premium_yearly',
    },
} as const;

/**
 * Product metadata for display purposes
 */
export const PRODUCT_METADATA = {
    monthly: {
        title: 'Premium Aylık',
        description: 'Tüm premium özelliklere aylık erişim',
        features: [
            'Gelişmiş AI modeli',
            '1000 mesaj/ay',
            'Öncelikli yanıt',
            'Kişisel içgörüler',
            'Gelişmiş analizler',
        ],
    },
    yearly: {
        title: 'Premium Yıllık',
        description: 'Tüm premium özelliklere yıllık erişim - %17 tasarruf',
        features: [
            'Gelişmiş AI modeli',
            '1000 mesaj/ay',
            'Öncelikli yanıt',
            'Kişisel içgörüler',
            'Gelişmiş analizler',
            '%17 tasarruf',
        ],
        badge: 'En Popüler',
    },
} as const;

/**
 * Trial configuration
 */
export const TRIAL_CONFIG = {
    enabled: true,
    durationDays: 7,
    description: '7 gün ücretsiz deneyin, istediğiniz zaman iptal edin',
} as const;

/**
 * Subscription tiers
 */
export type SubscriptionTier = 'monthly' | 'yearly';

/**
 * Get product ID for current platform
 */
export function getProductId(tier: SubscriptionTier, platform: 'ios' | 'android'): string {
    return IAP_CONFIG[platform][tier];
}

/**
 * Get all product IDs for current platform
 */
export function getAllProductIds(platform: 'ios' | 'android'): string[] {
    return Object.values(IAP_CONFIG[platform]);
}
