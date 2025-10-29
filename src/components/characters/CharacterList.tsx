'use client';

import type { PlayerCharacterDTO } from '@/types';
import { CharacterListGrid } from './CharacterListGrid';
import { CharacterListEmpty } from './CharacterListEmpty';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface CharacterListProps {
  characters: PlayerCharacterDTO[];
  isLoading: boolean;
  onEdit: (character: PlayerCharacterDTO) => void;
  onDelete: (characterId: string) => void;
  onAddCharacter: () => void;
}

/**
 * Skeleton for a single character card
 */
const CharacterCardSkeleton = () => (
  <Card>
    <CardHeader className="pb-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
        <Skeleton className="h-6 w-32 flex-1" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* HP and AC */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
      {/* Ability Scores - 3x2 Grid */}
      <div className="pt-2 border-t">
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
      {/* Initiative and Perception */}
      <div className="pt-2 border-t">
        <Skeleton className="h-4 w-full" />
      </div>
    </CardContent>
  </Card>
);

/**
 * Loading skeleton for the character list with card-based layout
 */
const CharacterListSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <CharacterCardSkeleton />
    <CharacterCardSkeleton />
    <CharacterCardSkeleton />
    <CharacterCardSkeleton />
  </div>
);

/**
 * Main character list component that conditionally renders
 * either the grid, empty state, or loading state
 */
export const CharacterList = ({ characters, isLoading, onEdit, onDelete, onAddCharacter }: CharacterListProps) => {
  if (isLoading) {
    return <CharacterListSkeleton />;
  }

  if (characters.length === 0) {
    return <CharacterListEmpty onAddCharacter={onAddCharacter} />;
  }

  return <CharacterListGrid characters={characters} onEdit={onEdit} onDelete={onDelete} />;
};
