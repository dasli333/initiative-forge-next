import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import type { EmailResetInput, PasswordUpdateInput } from '@/lib/schemas';

export function usePasswordReset() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const requestReset = async (data: EmailResetInput) => {
    setError(null);
    setIsLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
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
  };

  const updatePassword = async (data: PasswordUpdateInput) => {
    setError(null);
    setIsLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
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
  };

  return {
    isLoading,
    error,
    isSuccess,
    requestReset,
    updatePassword,
  };
}
