'use client';

import { CharacterListItem } from './CharacterListItem';
import { CharacterFiltersCompact } from './CharacterFiltersCompact';
import type { PlayerCharacterCardViewModel, PlayerCharacterFilters } from '@/types/player-characters';

interface CharactersListProps {
  characters: PlayerCharacterCardViewModel[];
  selectedCharacterId: string | null;
  onCharacterSelect: (characterId: string) => void;
  factions: Array<{ id: string; name: string }>;
  filters: PlayerCharacterFilters;
  onFiltersChange: (filters: PlayerCharacterFilters) => void;
  isLoading: boolean;
}

/**
 * Left sidebar list for player characters
 * Includes status filter and scrollable character list
 */
export function CharactersList({
  characters,
  selectedCharacterId,
  onCharacterSelect,
  factions,
  filters,
  onFiltersChange,
  isLoading,
}: CharactersListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="px-3 pt-3 pb-3 border-b">
        <CharacterFiltersCompact
          filters={filters}
          onFiltersChange={onFiltersChange}
          factions={factions}
        />
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {isLoading ? (
          <div className="space-y-2">
            {/* Skeleton loading */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {filters.status || filters.faction_id !== undefined
                ? 'No characters match filters'
                : 'No characters yet'}
            </p>
            {(filters.status || filters.faction_id !== undefined) && (
              <button
                onClick={() => onFiltersChange({})}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {characters.map((character) => (
              <CharacterListItem
                key={character.id}
                character={character}
                isSelected={character.id === selectedCharacterId}
                onClick={() => onCharacterSelect(character.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="px-3 py-2 border-t text-xs text-muted-foreground">
        {characters.length} {characters.length === 1 ? 'character' : 'characters'}
      </div>
    </div>
  );
}
