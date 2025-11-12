'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useTransition, type ReactNode } from 'react';

interface NavigationProgressContextValue {
  isNavigating: boolean;
  navigate: (href: string) => void;
}

const NavigationProgressContext = createContext<NavigationProgressContextValue | null>(null);

/**
 * Provider that tracks Next.js navigation state using React 19 useTransition.
 * Detects navigation START immediately (not just data fetching).
 * Provides global isNavigating state for progress indicators.
 */
export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Navigate function that wraps router.push with transition
  const navigate = (href: string) => {
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <NavigationProgressContext.Provider value={{ isNavigating: isPending, navigate }}>
      {children}
    </NavigationProgressContext.Provider>
  );
}

/**
 * Hook to access navigation progress state.
 * Returns { isNavigating, navigate }.
 */
export function useNavigationProgress() {
  const context = useContext(NavigationProgressContext);
  if (!context) {
    throw new Error('useNavigationProgress must be used within NavigationProgressProvider');
  }
  return context;
}
