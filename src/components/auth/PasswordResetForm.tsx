'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { RequestResetForm } from './password-reset/RequestResetForm';
import { UpdatePasswordForm } from './password-reset/UpdatePasswordForm';
import { ResetSuccessMessage } from './password-reset/ResetSuccessMessage';
import { UpdateSuccessMessage } from './password-reset/UpdateSuccessMessage';
import type { EmailResetInput, PasswordUpdateInput } from '@/lib/schemas';

interface PasswordResetFormProps {
  isResettingPassword?: boolean;
}

export function PasswordResetForm({ isResettingPassword = false }: PasswordResetFormProps) {
  const [submittedEmail, setSubmittedEmail] = useState('');
  const { isLoading, error, isSuccess, requestReset, updatePassword } = usePasswordReset();

  const handleRequestReset = async (data: EmailResetInput) => {
    setSubmittedEmail(data.email);
    await requestReset(data);
  };

  const handleUpdatePassword = async (data: PasswordUpdateInput) => {
    await updatePassword(data);
  };

  // Success state for password reset request
  if (isSuccess && !isResettingPassword) {
    return <ResetSuccessMessage email={submittedEmail} />;
  }

  // Success state for password update
  if (isSuccess && isResettingPassword) {
    return <UpdateSuccessMessage />;
  }

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isResettingPassword ? (
        <UpdatePasswordForm onSubmit={handleUpdatePassword} isLoading={isLoading} />
      ) : (
        <RequestResetForm onSubmit={handleRequestReset} isLoading={isLoading} />
      )}
    </>
  );
}
