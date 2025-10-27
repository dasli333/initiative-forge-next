'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function UpdateSuccessMessage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <Alert className="border-primary/50 bg-primary/10">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Password updated successfully!</AlertTitle>
        <AlertDescription>
          Your password has been updated. You can now sign in with your new password.
        </AlertDescription>
      </Alert>

      <Button onClick={() => router.push('/login')} className="w-full">
        Go to login
      </Button>
    </div>
  );
}
