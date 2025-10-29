'use client';

import { useState } from 'react';
import type { PlayerCharacterDTO, CreatePlayerCharacterCommand } from '@/types';
import { CharacterListHeader } from './CharacterListHeader';
import { CharacterList } from './CharacterList';
import { CharacterFormModal } from './CharacterFormModal';
import {
  useCharactersQuery,
  useCreateCharacterMutation,
  useUpdateCharacterMutation,
  useDeleteCharacterMutation,
} from '@/hooks/useCharacters';
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

interface CharactersViewProps {
  campaignId: string;
  campaignName: string;
}

interface CharacterModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  editingCharacter: PlayerCharacterDTO | null;
}

/**
 * Main view component for managing player characters in a campaign
 */
export function CharactersView({ campaignId, campaignName }: CharactersViewProps) {
  const [modalState, setModalState] = useState<CharacterModalState>({
    isOpen: false,
    mode: 'create',
    editingCharacter: null,
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    character: PlayerCharacterDTO | null;
  }>({
    isOpen: false,
    character: null,
  });

  const { data: characters = [], isLoading, error } = useCharactersQuery(campaignId);
  const createMutation = useCreateCharacterMutation(campaignId);
  const updateMutation = useUpdateCharacterMutation(campaignId);
  const deleteMutation = useDeleteCharacterMutation(campaignId);

  const handleAddCharacter = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      editingCharacter: null,
    });
  };

  const handleEditCharacter = (character: PlayerCharacterDTO) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      editingCharacter: character,
    });
  };

  const handleDeleteCharacter = (characterId: string) => {
    const character = characters.find((c) => c.id === characterId);
    if (character) {
      setDeleteConfirmation({
        isOpen: true,
        character,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.character) return;

    await deleteMutation.mutateAsync(deleteConfirmation.character.id);
    setDeleteConfirmation({ isOpen: false, character: null });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create',
      editingCharacter: null,
    });
  };

  const handleSubmit = async (data: CreatePlayerCharacterCommand) => {
    if (modalState.mode === 'create') {
      await createMutation.mutateAsync(data);
    } else if (modalState.editingCharacter) {
      await updateMutation.mutateAsync({
        characterId: modalState.editingCharacter.id,
        command: data,
      });
    }
    handleCloseModal();
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
          <h2 className="mb-2 text-lg font-semibold text-destructive">Failed to load characters</h2>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto space-y-6 py-8">
      <CharacterListHeader campaignName={campaignName} campaignId={campaignId} onAddCharacter={handleAddCharacter} />

      <CharacterList
        characters={characters}
        isLoading={isLoading}
        onEdit={handleEditCharacter}
        onDelete={handleDeleteCharacter}
        onAddCharacter={handleAddCharacter}
      />

      <CharacterFormModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        character={modalState.editingCharacter}
        campaignId={campaignId}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen: boolean) => setDeleteConfirmation({ isOpen, character: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Character</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">{deleteConfirmation.character?.name}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-delete-character"
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
