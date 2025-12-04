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
import { StoryItemCard } from './StoryItemCard';
import { StoryItemFiltersCompact } from './StoryItemFiltersCompact';
import type { StoryItemDTO, StoryItemFilters } from '@/types/story-items';

interface Owner {
  id: string;
  name: string;
}

interface StoryItemsListProps {
  items: StoryItemDTO[];
  selectedId: string | null;
  onItemSelect: (id: string) => void;
  filters: StoryItemFilters;
  onFiltersChange: (filters: StoryItemFilters) => void;
  isLoading: boolean;
  // Owner data for filters
  npcs: Owner[];
  playerCharacters: Owner[];
  factions: Owner[];
  locations: Owner[];
}

type SortOption = 'recent' | 'name-asc' | 'name-desc' | 'owner';

/**
 * Left panel list for story items
 * Includes search, sort, filters, and scrollable item list
 */
export function StoryItemsList({
  items,
  selectedId,
  onItemSelect,
  filters,
  onFiltersChange,
  isLoading,
  npcs,
  playerCharacters,
  factions,
  locations,
}: StoryItemsListProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Client-side filtering and sorting
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Apply local search
    if (localSearch.trim()) {
      const searchLower = localSearch.toLowerCase();
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchLower)
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
      case 'owner':
        // Sort by owner name (items without owner at end)
        result.sort((a, b) => {
          const aOwner = a.current_owner_name || '';
          const bOwner = b.current_owner_name || '';
          if (!aOwner && !bOwner) return 0;
          if (!aOwner) return 1;
          if (!bOwner) return -1;
          return aOwner.localeCompare(bOwner);
        });
        break;
      case 'recent':
      default:
        // Already sorted by created_at desc from API
        break;
    }

    return result;
  }, [items, localSearch, sortBy]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search story items..."
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
            <SelectItem value="owner">Owner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filters */}
      <div className="px-3 pb-3 border-b">
        <StoryItemFiltersCompact
          filters={filters}
          onFiltersChange={onFiltersChange}
          npcs={npcs}
          playerCharacters={playerCharacters}
          factions={factions}
          locations={locations}
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
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {items.length === 0 ? 'No story items yet' : 'No items match filters'}
            </p>
            {items.length > 0 && (
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
          <div className="space-y-2">
            {filteredAndSortedItems.map((item) => (
              <StoryItemCard
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                onClick={() => onItemSelect(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
