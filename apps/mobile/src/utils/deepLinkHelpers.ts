import * as Linking from 'expo-linking';

/**
 * Deep link URL oluşturma yardımcıları
 */

const APP_SCHEME = 'wellness';
const UNIVERSAL_LINK_DOMAIN = 'wellness-companion.app';

/**
 * URL scheme deep link oluştur
 * Örnek: wellness://premium
 */
export function createDeepLink(path: string, params?: Record<string, string>): string {
    const url = Linking.createURL(path, {
        scheme: APP_SCHEME,
        queryParams: params,
    });
    return url;
}

/**
 * Universal link oluştur (iOS için)
 * Örnek: https://wellness-companion.app/premium
 */
export function createUniversalLink(path: string, params?: Record<string, string>): string {
    const queryString = params
        ? '?' + Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&')
        : '';

    return `https://${UNIVERSAL_LINK_DOMAIN}/${path}${queryString}`;
}

/**
 * Paylaşım için uygun link oluştur
 * iOS'ta universal link, Android'de deep link kullanır
 */
export function createShareableLink(path: string, params?: Record<string, string>): string {
    // Universal link her iki platformda da çalışır
    return createUniversalLink(path, params);
}

/**
 * Soru paylaşım linki oluştur
 */
export function createQuestionShareLink(questionId: string): string {
    return createShareableLink('community/question', { id: questionId });
}

/**
 * Makale paylaşım linki oluştur
 */
export function createArticleShareLink(slug: string): string {
    return createShareableLink(slug);
}

/**
 * Premium paylaşım linki oluştur
 */
export function createPremiumShareLink(): string {
    return createShareableLink('premium');
}

/**
 * Davet linki oluştur
 */
export function createInviteLink(referralCode?: string): string {
    return createShareableLink('', referralCode ? { ref: referralCode } : undefined);
}
