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
import { NPCListItem } from './NPCListItem';
import { NPCFiltersCompact } from './NPCFiltersCompact';
import type { NPCCardViewModel, NPCFilters } from '@/types/npcs';
import type { NPCTagDTO } from '@/types/npc-tags';

interface NPCsListProps {
  npcs: NPCCardViewModel[];
  selectedNPCId: string | null;
  onNPCSelect: (npcId: string) => void;
  factions: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  tags: NPCTagDTO[];
  isLoading: boolean;
}

type SortOption = 'name-asc' | 'name-desc' | 'recent' | 'status';

/**
 * Left sidebar list for NPCs
 * Includes search, sort, filters, and scrollable NPC list
 */
export function NPCsList({
  npcs,
  selectedNPCId,
  onNPCSelect,
  factions,
  locations,
  tags,
  isLoading,
}: NPCsListProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filters, setFilters] = useState<NPCFilters>({});

  // Client-side filtering and sorting
  const filteredAndSortedNPCs = useMemo(() => {
    let result = [...npcs];

    // Apply local search (in addition to server-side search)
    if (localSearch.trim()) {
      const searchLower = localSearch.toLowerCase();
      result = result.filter(
        (npcVM) =>
          npcVM.npc.name.toLowerCase().includes(searchLower) ||
          npcVM.npc.role?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.npc.name.localeCompare(b.npc.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.npc.name.localeCompare(a.npc.name));
        break;
      case 'status':
        // Sort by status: alive -> unknown -> dead
        const statusOrder = { alive: 0, unknown: 1, dead: 2 };
        result.sort((a, b) => statusOrder[a.npc.status] - statusOrder[b.npc.status]);
        break;
      case 'recent':
      default:
        // Already sorted by created_at desc from API
        break;
    }

    return result;
  }, [npcs, localSearch, sortBy]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search NPCs..."
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
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filters */}
      <div className="px-3 pb-3 border-b">
        <NPCFiltersCompact
          filters={filters}
          onFiltersChange={setFilters}
          factions={factions}
          locations={locations}
          tags={tags}
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
        ) : filteredAndSortedNPCs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {npcs.length === 0 ? 'No NPCs yet' : 'No NPCs match filters'}
            </p>
            {npcs.length > 0 && (
              <button
                onClick={() => {
                  setLocalSearch('');
                  setFilters({});
                }}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Clear search and filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredAndSortedNPCs.map((npcVM) => (
              <NPCListItem
                key={npcVM.npc.id}
                npc={npcVM}
                isSelected={npcVM.npc.id === selectedNPCId}
                onClick={() => onNPCSelect(npcVM.npc.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="px-3 py-2 border-t text-xs text-muted-foreground">
        Showing {filteredAndSortedNPCs.length} of {npcs.length} NPCs
      </div>
    </div>
  );
}
