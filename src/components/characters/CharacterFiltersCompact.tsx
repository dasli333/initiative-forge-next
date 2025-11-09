'use client';

import { Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { PlayerCharacterFilters } from '@/types/player-characters';

interface CharacterFiltersCompactProps {
  filters: PlayerCharacterFilters;
  onFiltersChange: (filters: PlayerCharacterFilters) => void;
  factions: Array<{ id: string; name: string }>;
}

/**
 * Compact filters for player characters list
 * Shows: status, faction
 */
export function CharacterFiltersCompact({
  filters,
  onFiltersChange,
  factions,
}: CharacterFiltersCompactProps) {
  const hasActiveFilters =
    filters.status || filters.faction_id !== undefined;

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Filter className="w-3 h-3" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-6 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Status Filter */}
      <div className="space-y-1">
        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          Status
        </label>
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => {
            if (value === 'all') {
              const { status, ...rest } = filters;
              onFiltersChange(rest);
            } else {
              onFiltersChange({ ...filters, status: value as 'active' | 'retired' | 'deceased' });
            }
          }}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
            <SelectItem value="deceased">Deceased</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Faction Filter */}
      {factions.length > 0 && (
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Faction
          </label>
          <Select
            value={
              filters.faction_id === null
                ? 'no-faction'
                : filters.faction_id || 'all'
            }
            onValueChange={(value) => {
              if (value === 'all') {
                const { faction_id, ...rest } = filters;
                onFiltersChange(rest);
              } else if (value === 'no-faction') {
                onFiltersChange({ ...filters, faction_id: null });
              } else {
                onFiltersChange({ ...filters, faction_id: value });
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All factions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All factions</SelectItem>
              <SelectItem value="no-faction">No faction</SelectItem>
              {factions.map((faction) => (
                <SelectItem key={faction.id} value={faction.id}>
                  {faction.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
