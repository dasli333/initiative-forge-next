'use client';

import { useState, useCallback, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

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
  }, [email, password, confirmPassword]);

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
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (authError) {
          // Handle specific Supabase error messages
          if (authError.message.includes('already registered')) {
            setError('This email is already registered. Please log in instead.');
          } else if (authError.message.includes('Password should be')) {
            setError('Password does not meet security requirements.');
          } else {
            setError(authError.message);
          }
          return;
        }

        // Registration successful - show success message
        setIsSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, validateForm]
  );

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <Alert className="border-primary/50 bg-primary/10">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Account created successfully!</AlertTitle>
          <AlertDescription>
            We've sent a confirmation email to <strong>{email}</strong>. Please check your inbox
            and click the verification link to activate your account.
          </AlertDescription>
        </Alert>

        <Button onClick={() => (window.location.href = '/login')} className="w-full">
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create your account</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your details to get started with Initiative Forge
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
          <Label htmlFor={passwordId}>Password</Label>
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
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </div>
  );
}
