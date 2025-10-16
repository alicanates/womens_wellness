/**
 * Error Handling Utilities
 * 
 * Centralized error handling and user-friendly error messages
 * 
 * Requirements: 2.8, 5.6, 6.4, 6.5
 */

import { Alert, Platform, Linking } from 'react-native';
import { IAPServiceError, IAPErrorCode } from '@/services/iap.mock';

/**
 * Error types
 */
export enum ErrorType {
    NETWORK = 'NETWORK',
    TIMEOUT = 'TIMEOUT',
    RATE_LIMIT = 'RATE_LIMIT',
    QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
    VALIDATION = 'VALIDATION',
    AUTHENTICATION = 'AUTHENTICATION',
    PERMISSION = 'PERMISSION',
    NOT_FOUND = 'NOT_FOUND',
    SERVER = 'SERVER',
    UNKNOWN = 'UNKNOWN',
}

/**
 * Classify error type
 */
export function classifyError(error: any): ErrorType {
    const message = error.message?.toLowerCase() || '';
    const name = error.name?.toLowerCase() || '';

    // Network errors
    if (
        message.includes('network') ||
        message.includes('bağlantı') ||
        message.includes('internet') ||
        name === 'typeerror' ||
        name === 'networkerror' ||
        message.includes('fetch failed')
    ) {
        return ErrorType.NETWORK;
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('zaman aşımı')) {
        return ErrorType.TIMEOUT;
    }

    // Rate limit errors
    if (message.includes('rate limit') || message.includes('yoğun') || message.includes('too many')) {
        return ErrorType.RATE_LIMIT;
    }

    // Quota exceeded
    if (message.includes('quota') || message.includes('kota') || message.includes('limit exceeded')) {
        return ErrorType.QUOTA_EXCEEDED;
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('geçersiz')) {
        return ErrorType.VALIDATION;
    }

    // Authentication errors
    if (
        message.includes('unauthorized') ||
        message.includes('authentication') ||
        message.includes('oturum') ||
        error.status === 401
    ) {
        return ErrorType.AUTHENTICATION;
    }

    // Permission errors
    if (message.includes('permission') || message.includes('forbidden') || error.status === 403) {
        return ErrorType.PERMISSION;
    }

    // Not found errors
    if (message.includes('not found') || message.includes('bulunamadı') || error.status === 404) {
        return ErrorType.NOT_FOUND;
    }

    // Server errors
    if (error.status >= 500 || message.includes('server error')) {
        return ErrorType.SERVER;
    }

    return ErrorType.UNKNOWN;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: any): string {
    // Handle IAPServiceError
    if (error instanceof IAPServiceError) {
        return error.getUserMessage();
    }

    // Classify and return appropriate message
    const errorType = classifyError(error);

    switch (errorType) {
        case ErrorType.NETWORK:
            return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
        case ErrorType.TIMEOUT:
            return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
        case ErrorType.RATE_LIMIT:
            return 'Çok fazla istek gönderdiniz. Lütfen birkaç saniye bekleyin.';
        case ErrorType.QUOTA_EXCEEDED:
            return 'Mesaj kotanız doldu. Premium\'a geçerek sınırsız mesaj gönderin.';
        case ErrorType.VALIDATION:
            return 'Girdiğiniz bilgiler geçersiz. Lütfen kontrol edin.';
        case ErrorType.AUTHENTICATION:
            return 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
        case ErrorType.PERMISSION:
            return 'Bu işlem için yetkiniz yok.';
        case ErrorType.NOT_FOUND:
            return 'İstenen kaynak bulunamadı.';
        case ErrorType.SERVER:
            return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
        default:
            return error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
}

/**
 * Check if error is recoverable (user can retry)
 */
export function isRecoverableError(error: any): boolean {
    // Handle IAPServiceError
    if (error instanceof IAPServiceError) {
        return error.isRecoverable();
    }

    const errorType = classifyError(error);
    const recoverableTypes = [
        ErrorType.NETWORK,
        ErrorType.TIMEOUT,
        ErrorType.RATE_LIMIT,
        ErrorType.SERVER,
    ];

    return recoverableTypes.includes(errorType);
}

/**
 * Check if error requires user action
 */
export function requiresUserAction(error: any): boolean {
    // Handle IAPServiceError
    if (error instanceof IAPServiceError) {
        return error.requiresUserAction();
    }

    const errorType = classifyError(error);
    const actionRequiredTypes = [
        ErrorType.AUTHENTICATION,
        ErrorType.PERMISSION,
        ErrorType.VALIDATION,
    ];

    return actionRequiredTypes.includes(errorType);
}

/**
 * Show error alert with appropriate actions
 */
export function showErrorAlert(
    error: any,
    options?: {
        title?: string;
        onRetry?: () => void;
        onCancel?: () => void;
    }
) {
    const message = getUserFriendlyMessage(error);
    const recoverable = isRecoverableError(error);
    const needsAction = requiresUserAction(error);

    // Build alert buttons
    const buttons: any[] = [];

    // Cancel button
    buttons.push({
        text: 'Tamam',
        style: 'cancel',
        onPress: options?.onCancel,
    });

    // Retry button for recoverable errors
    if (recoverable && options?.onRetry) {
        buttons.push({
            text: 'Tekrar Dene',
            onPress: options.onRetry,
        });
    }

    // Settings button for errors requiring user action
    if (needsAction) {
        buttons.push({
            text: 'Ayarlar',
            onPress: () => {
                if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                } else {
                    Linking.openSettings();
                }
            },
        });
    }

    // Show alert
    Alert.alert(
        options?.title || 'Hata',
        message,
        buttons
    );
}

/**
 * Handle IAP errors specifically
 */
export function handleIAPError(
    error: any,
    options?: {
        onRestore?: () => void;
        onRetry?: () => void;
        onCancel?: () => void;
    }
) {
    if (!(error instanceof IAPServiceError)) {
        showErrorAlert(error, options);
        return;
    }

    const userMessage = error.getUserMessage();

    // User cancelled - don't show error
    if (error.code === IAPErrorCode.USER_CANCELLED) {
        console.log('[Error] User cancelled purchase');
        options?.onCancel?.();
        return;
    }

    // Already owned - offer restore
    if (error.code === IAPErrorCode.ALREADY_OWNED) {
        Alert.alert(
            'Zaten Sahipsiniz',
            userMessage,
            [
                { text: 'İptal', style: 'cancel', onPress: options?.onCancel },
                {
                    text: 'Geri Yükle',
                    onPress: options?.onRestore,
                },
            ]
        );
        return;
    }

    // Network error - offer retry
    if (error.isRecoverable() && options?.onRetry) {
        Alert.alert(
            'Bağlantı Hatası',
            userMessage,
            [
                { text: 'İptal', style: 'cancel', onPress: options?.onCancel },
                {
                    text: 'Tekrar Dene',
                    onPress: options.onRetry,
                },
            ]
        );
        return;
    }

    // Requires user action
    if (error.requiresUserAction()) {
        Alert.alert(
            'İşlem Gerekli',
            userMessage,
            [
                { text: 'Tamam', onPress: options?.onCancel },
                {
                    text: 'Ayarlar',
                    onPress: () => {
                        if (Platform.OS === 'ios') {
                            Linking.openURL('app-settings:');
                        } else {
                            Linking.openSettings();
                        }
                    },
                },
            ]
        );
        return;
    }

    // Generic error
    Alert.alert(
        'Hata',
        userMessage,
        [{ text: 'Tamam', onPress: options?.onCancel }]
    );
}

/**
 * Log error for debugging
 */
export function logError(error: any, context?: string) {
    const errorType = classifyError(error);
    const message = getUserFriendlyMessage(error);

    console.error(`[Error${context ? ` - ${context}` : ''}]`, {
        type: errorType,
        message,
        originalError: error,
        stack: error.stack,
    });
}
