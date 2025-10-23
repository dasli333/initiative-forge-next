'use client';

import { useState, useCallback, useId } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

interface PasswordResetFormProps {
  isResettingPassword?: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function PasswordResetForm({ isResettingPassword = false }: PasswordResetFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const validateEmailForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [email]);

  const validatePasswordForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [password, confirmPassword]);

  const handleRequestReset = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setFieldErrors({});

      if (!validateEmailForm()) {
        return;
      }

      setIsLoading(true);

      try {
        const supabase = getSupabaseClient();
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/callback`,
        });

        if (resetError) {
          setError(resetError.message);
          return;
        }

        setIsSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [email, validateEmailForm]
  );

  const handleUpdatePassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setFieldErrors({});

      if (!validatePasswordForm()) {
        return;
      }

      setIsLoading(true);

      try {
        const supabase = getSupabaseClient();
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });

        if (updateError) {
          setError(updateError.message);
          return;
        }

        setIsSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [password, validatePasswordForm, router]
  );

  // Success state for password reset request
  if (isSuccess && !isResettingPassword) {
    return (
      <div className="space-y-6">
        <Alert className="border-primary/50 bg-primary/10">
          <Mail className="h-4 w-4" />
          <AlertTitle>Check your email</AlertTitle>
          <AlertDescription>
            We've sent a password reset link to <strong>{email}</strong>. Please check your inbox
            and click the link to reset your password.
          </AlertDescription>
        </Alert>

        <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
          Back to login
        </Button>
      </div>
    );
  }

  // Success state for password update
  if (isSuccess && isResettingPassword) {
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

  // Update password form (when user has token)
  if (isResettingPassword) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Set your new password</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor={passwordId}>New password</Label>
            <Input
              id={passwordId}
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              placeholder="At least 8 characters"
              disabled={isLoading}
              aria-invalid={!!fieldErrors.password}
              className={fieldErrors.password ? 'border-destructive' : ''}
            />
            {fieldErrors.password && (
              <p className="text-sm text-destructive mt-1">{fieldErrors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={confirmPasswordId}>Confirm password</Label>
            <Input
              id={confirmPasswordId}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              placeholder="Re-enter your password"
              disabled={isLoading}
              aria-invalid={!!fieldErrors.confirmPassword}
              className={fieldErrors.confirmPassword ? 'border-destructive' : ''}
            />
            {fieldErrors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              'Update password'
            )}
          </Button>
        </form>
      </div>
    );
  }

  // Request password reset form
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reset your password</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleRequestReset} className="space-y-4" noValidate>
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>
    </div>
  );
}
