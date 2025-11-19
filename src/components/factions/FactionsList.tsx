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
import { FactionListItem } from './FactionListItem';
import type { FactionCardViewModel } from '@/types/factions';

interface FactionsListProps {
  factions: FactionCardViewModel[];
  selectedFactionId: string | null;
  onFactionSelect: (factionId: string) => void;
  isLoading: boolean;
}

type SortOption = 'name-asc' | 'name-desc' | 'recent' | 'members';

/**
 * Left sidebar list for Factions
 * Includes search, sort, and scrollable faction list
 * No filters in MVP
 */
export function FactionsList({
  factions,
  selectedFactionId,
  onFactionSelect,
  isLoading,
}: FactionsListProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Client-side filtering and sorting
  const filteredAndSortedFactions = useMemo(() => {
    let result = [...factions];

    // Apply local search
    if (localSearch.trim()) {
      const searchLower = localSearch.toLowerCase();
      result = result.filter(
        (factionVM) =>
          factionVM.faction.name.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.faction.name.localeCompare(b.faction.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.faction.name.localeCompare(a.faction.name));
        break;
      case 'members':
        result.sort((a, b) => b.memberCount - a.memberCount);
        break;
      case 'recent':
      default:
        // Already sorted by created_at desc from API
        break;
    }

    return result;
  }, [factions, localSearch, sortBy]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search factions..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="px-3 pb-3 border-b">
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="h-8 text-xs w-full">
            <ArrowUpDown className="w-3 h-3 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently added</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="members">Member count</SelectItem>
          </SelectContent>
        </Select>
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
        ) : filteredAndSortedFactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {factions.length === 0 ? 'No factions yet' : 'No factions match search'}
            </p>
            {factions.length > 0 && (
              <button
                onClick={() => setLocalSearch('')}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredAndSortedFactions.map((factionVM) => (
              <FactionListItem
                key={factionVM.faction.id}
                faction={factionVM}
                isSelected={factionVM.faction.id === selectedFactionId}
                onClick={() => onFactionSelect(factionVM.faction.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="px-3 py-2 border-t text-xs text-muted-foreground">
        Showing {filteredAndSortedFactions.length} of {factions.length} factions
      </div>
    </div>
  );
}
