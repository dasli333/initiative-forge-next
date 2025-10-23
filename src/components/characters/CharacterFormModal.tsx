'use client';

import { useState, useRef } from 'react';
import type { PlayerCharacter, CreatePlayerCharacterCommand } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CharacterForm } from './CharacterForm';

interface CharacterFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  character: PlayerCharacter | null;
  campaignId: string;
  onClose: () => void;
  onSubmit: (data: CreatePlayerCharacterCommand) => Promise<void>;
  isSubmitting: boolean;
}

/**
 * Modal dialog for creating/editing player characters
 * Includes unsaved changes confirmation
 */
export const CharacterFormModal = ({
  isOpen,
  mode,
  character,
  campaignId,
  onClose,
  onSubmit,
  isSubmitting,
}: CharacterFormModalProps) => {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleCloseAttempt = () => {
    if (isDirty && !isSubmitting) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedWarning(false);
    setIsDirty(false);
    onClose();
  };

  const handleFormSubmit = () => {
    formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseAttempt}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>{mode === 'create' ? 'Add Player Character' : 'Edit Character'}</DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Fill in the details to create a new player character'
                : 'Update character information and abilities'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6">
            <CharacterForm
              ref={formRef}
              mode={mode}
              defaultValues={character || undefined}
              onSubmit={onSubmit}
              onDirtyChange={setIsDirty}
            />
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button type="button" variant="outline" onClick={handleCloseAttempt} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="button"
              data-testid="submit-character-form"
              onClick={handleFormSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Character' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close? All changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>Discard Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
