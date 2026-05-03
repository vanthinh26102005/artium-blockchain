import { useEffect, useState } from "react";

/**
 * Custom hook for debouncing a value
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 */
/**
 * useDebounce - Custom React hook
 * @returns void
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set up the timeout
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
/**
 * timer - Utility function
 * @returns void
 */

        // Clean up the timeout if value changes before delay
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
