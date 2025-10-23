'use client';

import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CharacterListEmptyProps {
  onAddCharacter: () => void;
}

/**
 * Empty state component displayed when no characters exist in the campaign
 */
export const CharacterListEmpty = ({ onAddCharacter }: CharacterListEmptyProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-6">
        <UserPlus className="h-12 w-12 text-muted-foreground" />
      </div>

      <h2 className="mb-2 text-xl font-semibold">No characters yet</h2>

      <p className="mb-6 text-muted-foreground">Add your first player character to get started</p>

      <Button onClick={onAddCharacter} className="bg-emerald-600 hover:bg-emerald-700">
        <UserPlus className="mr-2 h-4 w-4" />
        Add Character
      </Button>
    </div>
  );
};
