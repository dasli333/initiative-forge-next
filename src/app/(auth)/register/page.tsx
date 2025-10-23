'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // If already logged in, redirect to campaigns
  useEffect(() => {
    if (!loading && user) {
      router.push('/campaigns');
    }
  }, [user, loading, router]);

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
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in here
        </Link>
      </p>
    </>
  );
}
