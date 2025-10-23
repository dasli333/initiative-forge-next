'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const redirect = searchParams.get('redirect') || '/campaigns';

  // If already logged in, redirect to campaigns
  useEffect(() => {
    if (!loading && user) {
      router.push(redirect);
    }
  }, [user, loading, redirect, router]);

  // Show nothing while checking auth
  if (loading) {
    return null;
  }

  // If user is logged in, don't show form (will redirect)
  if (user) {
    return null;
  }

  return (
    <>
      <LoginForm redirect={redirect} />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Register here
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
