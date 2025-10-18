import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to debounce a value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set up the timeout
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timeout if value changes before delay
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Advanced debounce hook with loading state and cancel support
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Object with debounced value, loading state, and cancel function
 */
export function useAdvancedDebounce<T>(
    value: T,
    delay: number = 500
): {
    debouncedValue: T;
    isDebouncing: boolean;
    cancel: () => void;
} {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    const [isDebouncing, setIsDebouncing] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            setIsDebouncing(false);
        }
    }, []);

    useEffect(() => {
        // If value is empty, update immediately
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            setDebouncedValue(value);
            setIsDebouncing(false);
            return;
        }

        setIsDebouncing(true);

        // Set up the timeout
        timeoutRef.current = setTimeout(() => {
            setDebouncedValue(value);
            setIsDebouncing(false);
            timeoutRef.current = null;
        }, delay);

        // Clean up the timeout if value changes before delay
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, delay]);

    return { debouncedValue, isDebouncing, cancel };
}

/**
 * Debounce a callback function
 * 
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = 500
): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    // Update callback ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay]
    );
}
