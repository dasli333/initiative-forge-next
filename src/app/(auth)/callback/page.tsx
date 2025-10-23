'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

type Status = 'processing' | 'success' | 'error';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('processing');
  const [message, setMessage] = useState('Processing your request...');

  useEffect(() => {
    const handleCallback = async () => {
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const type = searchParams.get('type');

      // Handle errors from Supabase
      if (error) {
        setStatus('error');
        setMessage(errorDescription || 'An error occurred during authentication');
        return;
      }

      // Email verification (signup confirmation)
      if (type === 'signup') {
        setStatus('success');
        setMessage('Email verification successful! You can now sign in.');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      // Password recovery
      if (type === 'recovery') {
        setStatus('success');
        setMessage('Password reset link verified. Redirecting...');
        setTimeout(() => router.push('/reset-password'), 2000);
        return;
      }

      // Try to exchange the code for a session
      try {
        const supabase = getSupabaseClient();
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (sessionError) {
          setStatus('error');
          setMessage(sessionError.message);
          return;
        }

        // Success - redirect to campaigns
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        setTimeout(() => router.push('/campaigns'), 2000);
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="space-y-6">
      {status === 'processing' && (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Processing...</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4">
          <Alert className="border-primary/50 bg-primary/10">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>

          <Button onClick={() => router.push('/login')} className="w-full">
            Continue
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>

          <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
            Back to login
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>}>
      <CallbackContent />
    </Suspense>
  );
}
