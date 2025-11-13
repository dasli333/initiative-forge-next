'use client';

import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useNavigationProgress } from '@/providers/NavigationProgressProvider';
import { useProgressBarVisibility } from '@/hooks/useProgressBarVisibility';

/**
 * Unified progress bar that tracks BOTH Next.js navigation and React Query fetching.
 * Shows immediately on navigation start (not just data fetching).
 * Uses GPU-accelerated CSS transforms for smooth 60fps animation.
 * Prevents flicker via delayed show (100ms) and minimum display time (200ms).
 */
export function NetworkProgressBar() {
  const { isNavigating } = useNavigationProgress();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isActive = isNavigating || isFetching > 0 || isMutating > 0;
  const isVisible = useProgressBarVisibility(isActive);

  if (!isVisible) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-50 h-1 overflow-hidden"
      role="progressbar"
      aria-label="Loading"
    >
      <div
        className="h-full bg-emerald-500 will-change-transform"
        style={{ animation: 'var(--animate-network-progress)' }}
      />
    </div>
  );
}
