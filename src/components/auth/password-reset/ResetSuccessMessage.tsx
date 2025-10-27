'use client';

import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ResetSuccessMessageProps {
  email: string;
}

export function ResetSuccessMessage({ email }: ResetSuccessMessageProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <Alert className="border-primary/50 bg-primary/10">
        <Mail className="h-4 w-4" />
        <AlertTitle>Check your email</AlertTitle>
        <AlertDescription>
          We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and
          click the link to reset your password.
        </AlertDescription>
      </Alert>

      <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
        Back to login
      </Button>
    </div>
  );
}
