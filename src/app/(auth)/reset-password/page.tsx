'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  // If we have a recovery type, user is setting new password
  const isResettingPassword = type === 'recovery';

  return (
    <>
      <PasswordResetForm isResettingPassword={isResettingPassword} />
      {!isResettingPassword && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
