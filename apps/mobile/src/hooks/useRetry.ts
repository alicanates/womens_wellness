import { useState, useCallback } from 'react';

interface UseRetryOptions {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number) => void;
    onMaxRetriesReached?: () => void;
}

interface UseRetryReturn {
    retry: () => Promise<void>;
    isRetrying: boolean;
    retryCount: number;
    canRetry: boolean;
    reset: () => void;
}

export function useRetry(
    fn: () => Promise<any>,
    options: UseRetryOptions = {}
): UseRetryReturn {
    const {
        maxRetries = 3,
        retryDelay = 1000,
        onRetry,
        onMaxRetriesReached,
    } = options;

    const [isRetrying, setIsRetrying] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const canRetry = retryCount < maxRetries;

    const retry = useCallback(async () => {
        if (!canRetry) {
            onMaxRetriesReached?.();
            return;
        }

        setIsRetrying(true);
        setRetryCount((prev) => prev + 1);

        try {
            onRetry?.(retryCount + 1);

            // Add delay before retry
            if (retryDelay > 0) {
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }

            await fn();
        } catch (error) {
            console.error(`Retry attempt ${retryCount + 1} failed:`, error);
            throw error;
        } finally {
            setIsRetrying(false);
        }
    }, [fn, retryCount, canRetry, retryDelay, onRetry, onMaxRetriesReached]);

    const reset = useCallback(() => {
        setRetryCount(0);
        setIsRetrying(false);
    }, []);

    return {
        retry,
        isRetrying,
        retryCount,
        canRetry,
        reset,
    };
}

/**
 * Hook for exponential backoff retry strategy
 */
export function useExponentialRetry(
    fn: () => Promise<any>,
    options: UseRetryOptions & { baseDelay?: number } = {}
): UseRetryReturn {
    const { baseDelay = 1000, ...restOptions } = options;
    const [retryCount, setRetryCount] = useState(0);

    // Calculate exponential delay: baseDelay * 2^retryCount
    const retryDelay = baseDelay * Math.pow(2, retryCount);

    return useRetry(fn, {
        ...restOptions,
        retryDelay,
    });
}
