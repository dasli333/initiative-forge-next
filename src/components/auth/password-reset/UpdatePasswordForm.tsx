'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordUpdateSchema, type PasswordUpdateInput } from '@/lib/schemas';

interface UpdatePasswordFormProps {
  onSubmit: (data: PasswordUpdateInput) => Promise<void>;
  isLoading: boolean;
}

export function UpdatePasswordForm({ onSubmit, isLoading }: UpdatePasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordUpdateInput>({
    resolver: zodResolver(PasswordUpdateSchema),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Set your new password</h2>
        <p className="mt-2 text-sm text-muted-foreground">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            disabled={isLoading}
            aria-invalid={!!errors.password}
            className={errors.password ? 'border-destructive' : ''}
            {...register('password')}
          />
          {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            disabled={isLoading}
            aria-invalid={!!errors.confirmPassword}
            className={errors.confirmPassword ? 'border-destructive' : ''}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
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
