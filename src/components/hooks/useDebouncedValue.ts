import { useState, useEffect } from "react";

/**
 * Hook that returns a debounced value
 * Useful for delaying API calls until user stops typing
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms for search)
 * @returns Debounced value that updates after the delay
 *
 * @example
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedSearch = useDebouncedValue(searchQuery, 300);
 * // API call will only happen 300ms after user stops typing
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
