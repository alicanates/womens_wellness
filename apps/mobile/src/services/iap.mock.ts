/**
 * Mock In-App Purchase Manager Service
 * 
 * Bu mock servis Expo Go'da geliştirme yaparken kullanılır.
 * Production build'de gerçek iap.ts kullanılacaktır.
 */

import type { Product, SubscriptionTier } from '../types/subscription';

// Purchase type for mock
export interface Purchase {
    productId: string;
    transactionId: string;
    transactionDate: number;
    transactionReceipt?: string;
    purchaseToken?: string;
}

/**
 * IAP Error Types
 */
export enum IAPErrorCode {
    NOT_INITIALIZED = 'NOT_INITIALIZED',
    INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
    PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
    PURCHASE_FAILED = 'PURCHASE_FAILED',
    VALIDATION_FAILED = 'VALIDATION_FAILED',
    RESTORE_FAILED = 'RESTORE_FAILED',
    USER_CANCELLED = 'USER_CANCELLED',
    ALREADY_OWNED = 'ALREADY_OWNED',
    NO_RECEIPT = 'NO_RECEIPT',
    NETWORK_ERROR = 'NETWORK_ERROR',
    ITEM_UNAVAILABLE = 'ITEM_UNAVAILABLE',
    SERVICE_ERROR = 'SERVICE_ERROR',
    RECEIPT_FAILED = 'RECEIPT_FAILED',
    PAYMENT_INVALID = 'PAYMENT_INVALID',
    PAYMENT_NOT_ALLOWED = 'PAYMENT_NOT_ALLOWED',
    STORE_PRODUCT_NOT_AVAILABLE = 'STORE_PRODUCT_NOT_AVAILABLE',
    CLOUD_SERVICE_PERMISSION_DENIED = 'CLOUD_SERVICE_PERMISSION_DENIED',
    CLOUD_SERVICE_NETWORK_CONNECTION_FAILED = 'CLOUD_SERVICE_NETWORK_CONNECTION_FAILED',
    CLOUD_SERVICE_REVOKED = 'CLOUD_SERVICE_REVOKED',
    PRIVACY_ACKNOWLEDGEMENT_REQUIRED = 'PRIVACY_ACKNOWLEDGEMENT_REQUIRED',
    UNAUTHORIZED_REQUEST_DATA = 'UNAUTHORIZED_REQUEST_DATA',
    INVALID_OFFER_IDENTIFIER = 'INVALID_OFFER_IDENTIFIER',
    INVALID_SIGNATURE = 'INVALID_SIGNATURE',
    MISSING_OFFER_PARAMS = 'MISSING_OFFER_PARAMS',
    INVALID_OFFER_PRICE = 'INVALID_OFFER_PRICE',
}

/**
 * Custom error class for IAP operations
 */
export class IAPServiceError extends Error {
    constructor(
        public code: IAPErrorCode,
        message: string,
        public originalError?: any,
        public userMessage?: string
    ) {
        super(message);
        this.name = 'IAPServiceError';
    }

    getUserMessage(): string {
        if (this.userMessage) return this.userMessage;

        switch (this.code) {
            case IAPErrorCode.USER_CANCELLED:
                return 'Satın alma işlemi iptal edildi.';
            case IAPErrorCode.ALREADY_OWNED:
                return 'Bu aboneliğe zaten sahipsiniz.';
            case IAPErrorCode.NETWORK_ERROR:
                return 'İnternet bağlantınızı kontrol edin.';
            case IAPErrorCode.ITEM_UNAVAILABLE:
                return 'Bu ürün şu anda satın alınamıyor.';
            case IAPErrorCode.PAYMENT_INVALID:
                return 'Ödeme bilgileriniz geçersiz.';
            case IAPErrorCode.PAYMENT_NOT_ALLOWED:
                return 'Bu cihazda satın alma yapma izniniz yok.';
            case IAPErrorCode.VALIDATION_FAILED:
                return 'Satın alma doğrulanamadı.';
            case IAPErrorCode.RESTORE_FAILED:
                return 'Satın alımlar geri yüklenemedi.';
            case IAPErrorCode.SERVICE_ERROR:
                return 'Mağaza servisi kullanılamıyor.';
            case IAPErrorCode.PRODUCT_NOT_FOUND:
                return 'Ürün bulunamadı.';
            default:
                return 'Bir hata oluştu.';
        }
    }

    isRecoverable(): boolean {
        const recoverableErrors = [
            IAPErrorCode.NETWORK_ERROR,
            IAPErrorCode.SERVICE_ERROR,
            IAPErrorCode.CLOUD_SERVICE_NETWORK_CONNECTION_FAILED,
        ];
        return recoverableErrors.includes(this.code);
    }

    requiresUserAction(): boolean {
        const actionRequiredErrors = [
            IAPErrorCode.ALREADY_OWNED,
            IAPErrorCode.PAYMENT_INVALID,
            IAPErrorCode.PAYMENT_NOT_ALLOWED,
            IAPErrorCode.PRIVACY_ACKNOWLEDGEMENT_REQUIRED,
        ];
        return actionRequiredErrors.includes(this.code);
    }
}

/**
 * Mock Products
 */
const MOCK_PRODUCTS: Product[] = [
    {
        productId: 'com.wellness.premium.monthly',
        title: 'Premium Aylık Abonelik',
        description: 'Tüm premium özelliklere erişim',
        price: '49.99',
        currency: 'TRY',
        localizedPrice: '₺49,99',
        tier: 'MONTHLY',
    },
    {
        productId: 'com.wellness.premium.yearly',
        title: 'Premium Yıllık Abonelik',
        description: 'Tüm premium özelliklere erişim - %40 indirim',
        price: '359.99',
        currency: 'TRY',
        localizedPrice: '₺359,99',
        tier: 'YEARLY',
    },
];

/**
 * Mock IAP Manager Class
 */
class MockIAPManager {
    private isInitialized = false;
    private products: Product[] = MOCK_PRODUCTS;

    async initialize(): Promise<void> {
        console.log('[MOCK IAP] Initializing...');
        await new Promise(resolve => setTimeout(resolve, 500));
        this.isInitialized = true;
        console.log('[MOCK IAP] Initialized successfully');
    }

    async loadProducts(): Promise<void> {
        console.log('[MOCK IAP] Loading products...');
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('[MOCK IAP] Products loaded:', this.products.length);
    }

    getProducts(): Product[] {
        return [...this.products];
    }

    getProduct(tier: SubscriptionTier): Product | undefined {
        const productId = tier === 'MONTHLY'
            ? 'com.wellness.premium.monthly'
            : 'com.wellness.premium.yearly';
        return this.products.find(p => p.productId === productId);
    }

    isReady(): boolean {
        return this.isInitialized;
    }

    async purchase(tier: SubscriptionTier): Promise<void> {
        console.log('[MOCK IAP] Simulating purchase for:', tier);

        if (!this.isInitialized) {
            throw new Error('IAP not initialized');
        }

        // Simulate purchase delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('[MOCK IAP] Purchase successful (mock)');
        console.warn('⚠️ MOCK MODE: Gerçek satın alma yapılmadı. Development build kullanın.');
    }

    async restorePurchases(): Promise<Purchase[]> {
        console.log('[MOCK IAP] Simulating restore purchases...');

        if (!this.isInitialized) {
            throw new Error('IAP not initialized');
        }

        // Simulate restore delay
        await new Promise(resolve => setTimeout(resolve, 800));

        console.log('[MOCK IAP] No purchases to restore (mock)');
        console.warn('⚠️ MOCK MODE: Gerçek geri yükleme yapılmadı. Development build kullanın.');

        return [];
    }

    async validatePurchase(purchase: Purchase): Promise<void> {
        console.log('[MOCK IAP] Simulating validation...');
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('[MOCK IAP] Validation successful (mock)');
    }

    async finishTransaction(purchase: Purchase): Promise<void> {
        console.log('[MOCK IAP] Finishing transaction (mock)');
    }

    async cleanup(): Promise<void> {
        console.log('[MOCK IAP] Cleaning up...');
        this.isInitialized = false;
    }

    async isAvailable(): Promise<boolean> {
        return true;
    }

    getStatus() {
        return {
            isInitialized: this.isInitialized,
            productsLoaded: this.products.length,
            hasListeners: true,
        };
    }
}

// Export singleton instance
export const iapManager = new MockIAPManager();

// Re-export types
export type { Product, SubscriptionTier };
