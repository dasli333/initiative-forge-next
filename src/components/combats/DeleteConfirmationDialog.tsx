'use client';

import { DeleteConfirmationDialog as SharedDeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog';

export interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  combatName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  combatName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmationDialogProps) {
  return (
    <SharedDeleteConfirmationDialog
      isOpen={isOpen}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isDeleting={isDeleting}
      entityName={combatName}
      entityType="combat"
    />
  );
}
