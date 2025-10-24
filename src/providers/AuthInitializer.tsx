'use client';

import { useEffect } from 'react';
import { useAuthStore, initAuthListener } from '@/stores/authStore';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * AuthInitializer - Initializes auth store on app mount
 *
 * This component:
 * - Checks initial auth state via checkAuth()
 * - Sets up auth state change listener via initAuthListener()
 * - Runs only once on mount
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Check initial auth state
    checkAuth();

    // Set up auth state change listener
    initAuthListener();
  }, []); // Run only once on mount

  return <>{children}</>;
}
