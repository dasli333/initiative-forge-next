import { useState, useEffect, useRef } from 'react';

/**
 * Prevents progress bar flicker by:
 * 1. Delaying initial show (250ms) - prevents bar appearing for fast operations
 * 2. Enforcing minimum display time (300ms) - prevents flicker on rapid false→true toggles
 *
 * @param isActive - Whether progress indicator should be active
 * @returns isVisible - Whether to actually render the progress bar
 */
export function useProgressBarVisibility(isActive: boolean): boolean {
  const [isVisible, setIsVisible] = useState(false);
  const showTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any pending timers
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    if (isActive) {
      // Delay showing bar by 250ms (prevents flicker on fast operations)
      showTimerRef.current = setTimeout(() => {
        setIsVisible(true);
        shownAtRef.current = Date.now();
      }, 250);
    } else if (shownAtRef.current) {
      // Bar was shown, enforce minimum display time
      const elapsed = Date.now() - shownAtRef.current;
      const minDisplayTime = 300;
      const remaining = minDisplayTime - elapsed;

      // Always use setTimeout (even for 0ms) to avoid synchronous setState in effect
      const delay = remaining > 0 ? remaining : 0;
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        shownAtRef.current = null;
      }, delay);
    } else {
      // Bar never shown (completed before 250ms delay), hide immediately via setTimeout(0)
      hideTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 0);
    }

    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isActive]);

  return isVisible;
}
