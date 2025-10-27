'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmailResetSchema, type EmailResetInput } from '@/lib/schemas';

interface RequestResetFormProps {
  onSubmit: (data: EmailResetInput) => Promise<void>;
  isLoading: boolean;
}

export function RequestResetForm({ onSubmit, isLoading }: RequestResetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailResetInput>({
    resolver: zodResolver(EmailResetSchema),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reset your password</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isLoading}
            aria-invalid={!!errors.email}
            className={errors.email ? 'border-destructive' : ''}
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
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
