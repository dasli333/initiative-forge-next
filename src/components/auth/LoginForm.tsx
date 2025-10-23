'use client';

import { useState, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

interface LoginFormProps {
  redirect?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginForm({ redirect = '/campaigns' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setFieldErrors({});

      if (!validateForm()) {
        return;
      }

      setIsLoading(true);

      try {
        const supabase = getSupabaseClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          // Handle specific Supabase error messages
          if (authError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else if (authError.message.includes('Email not confirmed')) {
            setError('Please verify your email address before logging in.');
          } else {
            setError(authError.message);
          }
          return;
        }

        // Successful login - redirect
        router.push(redirect);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, redirect, validateForm, router]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sign in to your account</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your credentials to access your campaigns
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor={emailId}>Email address</Label>
          <Input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            placeholder="you@example.com"
            disabled={isLoading}
            aria-invalid={!!fieldErrors.email}
            className={fieldErrors.email ? 'border-destructive' : ''}
          />
          {fieldErrors.email && (
            <p className="text-sm text-destructive mt-1">{fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={passwordId}>Password</Label>
            <a
              href="/reset-password"
              className="text-sm text-primary hover:underline transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <Input
            id={passwordId}
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            placeholder="Enter your password"
            disabled={isLoading}
            aria-invalid={!!fieldErrors.password}
            className={fieldErrors.password ? 'border-destructive' : ''}
          />
          {fieldErrors.password && (
            <p className="text-sm text-destructive mt-1">{fieldErrors.password}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </div>
  );
}
