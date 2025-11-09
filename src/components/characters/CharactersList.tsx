'use client';

import { useState, useMemo } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type SortOption = 'name-asc' | 'name-desc' | 'recent' | 'level' | 'status';

/**
 * Left sidebar list for player characters
 * Includes search, sort, filters, and scrollable character list
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
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Client-side filtering and sorting
  const filteredAndSortedCharacters = useMemo(() => {
    let result = [...characters];

    // Apply local search
    if (localSearch.trim()) {
      const searchLower = localSearch.toLowerCase();
      result = result.filter(
        (char) =>
          char.name.toLowerCase().includes(searchLower) ||
          char.class?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'level':
        result.sort((a, b) => (b.level || 0) - (a.level || 0));
        break;
      case 'status':
        // Sort by status: active -> retired -> deceased
        const statusOrder = { active: 0, retired: 1, deceased: 2 };
        result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
      case 'recent':
      default:
        // Already sorted by created_at asc from API
        break;
    }

    return result;
  }, [characters, localSearch, sortBy]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search characters..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="px-3 pb-2">
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="h-8 text-xs w-full">
            <ArrowUpDown className="w-3 h-3 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently added</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="level">Level (High-Low)</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filters */}
      <div className="px-3 pb-3 border-b">
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
        ) : filteredAndSortedCharacters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {characters.length === 0 ? 'No characters yet' : 'No characters match filters'}
            </p>
            {characters.length > 0 && (
              <button
                onClick={() => {
                  setLocalSearch('');
                  onFiltersChange({});
                }}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Clear search and filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredAndSortedCharacters.map((character) => (
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
        Showing {filteredAndSortedCharacters.length} of {characters.length} characters
      </div>
    </div>
  );
}
