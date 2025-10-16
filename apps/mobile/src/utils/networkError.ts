/**
 * Network error utilities for better error handling and user feedback
 */

export interface NetworkError {
    message: string;
    isNetworkError: boolean;
    isServerError: boolean;
    isClientError: boolean;
    statusCode?: number;
}

/**
 * Parse error and determine error type
 */
export function parseNetworkError(error: unknown): NetworkError {
    // Default error
    const defaultError: NetworkError = {
        message: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        isNetworkError: false,
        isServerError: false,
        isClientError: false,
    };

    // Not an error object
    if (!error) {
        return defaultError;
    }

    // Check if it's an axios/fetch error
    if (typeof error === 'object' && error !== null) {
        const err = error as any;

        // Network error (no response)
        if (err.message === 'Network Error' || err.code === 'ECONNABORTED' || !err.response) {
            return {
                message: 'İnternet bağlantınızı kontrol edin',
                isNetworkError: true,
                isServerError: false,
                isClientError: false,
            };
        }

        // HTTP error with response
        if (err.response) {
            const status = err.response.status;
            const data = err.response.data;

            // Server error (5xx)
            if (status >= 500) {
                return {
                    message: data?.message || 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
                    isNetworkError: false,
                    isServerError: true,
                    isClientError: false,
                    statusCode: status,
                };
            }

            // Client error (4xx)
            if (status >= 400) {
                let message = 'Bir hata oluştu';

                if (status === 404) {
                    message = 'İçerik bulunamadı';
                } else if (status === 401) {
                    message = 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
                } else if (status === 403) {
                    message = 'Bu işlem için yetkiniz yok';
                } else if (data?.message) {
                    message = data.message;
                }

                return {
                    message,
                    isNetworkError: false,
                    isServerError: false,
                    isClientError: true,
                    statusCode: status,
                };
            }
        }

        // Error with message
        if (err.message) {
            return {
                message: err.message,
                isNetworkError: false,
                isServerError: false,
                isClientError: false,
            };
        }
    }

    return defaultError;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
    return parseNetworkError(error).message;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
    const parsed = parseNetworkError(error);
    // Retry network errors and server errors, but not client errors
    return parsed.isNetworkError || parsed.isServerError;
}

/**
 * Get retry delay based on attempt count
 */
export function getRetryDelay(attemptIndex: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    return Math.min(1000 * 2 ** attemptIndex, 30000);
}
