'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { LandingPage } from '@/components/landing/LandingPage';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/campaigns');
    }
  }, [user, isLoading, router]);

  // Show landing page for unauthenticated users
  if (!isLoading && !user) {
    return <LandingPage />;
  }

  // Show loading state while checking auth
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
}
