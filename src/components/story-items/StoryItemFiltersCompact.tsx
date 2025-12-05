'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import type { StoryItemFilters } from '@/types/story-items';

interface Owner {
  id: string;
  name: string;
}

interface StoryItemFiltersCompactProps {
  filters: StoryItemFilters;
  onFiltersChange: (filters: StoryItemFilters) => void;
  // Owner data for autocomplete
  npcs: Owner[];
  playerCharacters: Owner[];
  factions: Owner[];
  locations: Owner[];
}

export function StoryItemFiltersCompact({
  filters,
  onFiltersChange,
  npcs,
  playerCharacters,
  factions,
  locations,
}: StoryItemFiltersCompactProps) {
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.current_owner_type) count++;
    if (filters.current_owner_id) count++;
    return count;
  }, [filters]);

  const handleOwnerTypeChange = (value: string) => {
    if (value === 'all') {
      // Clear both owner type and owner ID
      const { current_owner_type: _type, current_owner_id: _id, ...rest } = filters;
      onFiltersChange(rest);
    } else if (value === 'unknown') {
      // Set owner type to 'unknown', clear owner ID
      const { current_owner_id: _id, ...rest } = filters;
      onFiltersChange({ ...rest, current_owner_type: 'unknown' });
    } else {
      // Set owner type, clear owner ID (user will select new owner)
      const { current_owner_id: _id, ...rest } = filters;
      onFiltersChange({
        ...rest,
        current_owner_type: value as 'npc' | 'player_character' | 'faction' | 'location',
      });
    }
  };

  const handleOwnerChange = (value: string) => {
    if (value === 'all') {
      const { current_owner_id: _id, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, current_owner_id: value });
    }
  };

  const removeFilter = (key: keyof StoryItemFilters) => {
    if (key === 'current_owner_type') {
      // Clear both owner type and owner ID
      const { current_owner_type: _type, current_owner_id: _id, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      const { [key]: _, ...rest } = filters;
      onFiltersChange(rest);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  // Get owner list based on selected owner type
  const ownerOptions = useMemo(() => {
    switch (filters.current_owner_type) {
      case 'npc':
        return npcs;
      case 'player_character':
        return playerCharacters;
      case 'faction':
        return factions;
      case 'location':
        return locations;
      default:
        return [];
    }
  }, [filters.current_owner_type, npcs, playerCharacters, factions, locations]);

  // Get owner name for badge display
  const getOwnerName = () => {
    if (!filters.current_owner_id) return null;
    const owner = ownerOptions.find((o) => o.id === filters.current_owner_id);
    return owner?.name || 'Unknown';
  };

  // Show owner select only if type is selected and not 'unknown'
  const showOwnerSelect =
    filters.current_owner_type &&
    filters.current_owner_type !== 'unknown';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {/* Owner Type filter */}
        <div className="space-y-2">
          <Label>Owner Type</Label>
          <RadioGroup
            value={filters.current_owner_type || 'all'}
            onValueChange={handleOwnerTypeChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="owner-type-all" />
              <Label htmlFor="owner-type-all" className="font-normal">
                All types
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="npc" id="owner-type-npc" />
              <Label htmlFor="owner-type-npc" className="font-normal">
                NPC
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="player_character" id="owner-type-pc" />
              <Label htmlFor="owner-type-pc" className="font-normal">
                Player Character
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="faction" id="owner-type-faction" />
              <Label htmlFor="owner-type-faction" className="font-normal">
                Faction
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="location" id="owner-type-location" />
              <Label htmlFor="owner-type-location" className="font-normal">
                Location
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unknown" id="owner-type-unknown" />
              <Label htmlFor="owner-type-unknown" className="font-normal">
                Unknown
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Specific Owner filter (conditional) */}
        {showOwnerSelect && (
          <div className="mt-4 space-y-2">
            <Label>Specific Owner</Label>
            <Select
              value={filters.current_owner_id || 'all'}
              onValueChange={handleOwnerChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All owners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All owners</SelectItem>
                {ownerOptions.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Active filters chips */}
        {activeFilterCount > 0 && (
          <div className="mt-4 space-y-2 border-t pt-4">
            <div className="text-sm font-medium">Active Filters:</div>
            <div className="flex flex-wrap gap-1.5">
              {filters.current_owner_type && (
                <Badge variant="secondary" className="gap-1">
                  Owner Type: {filters.current_owner_type}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter('current_owner_type')}
                  />
                </Badge>
              )}
              {filters.current_owner_id && (
                <Badge variant="secondary" className="gap-1">
                  Owner: {getOwnerName()}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter('current_owner_id')}
                  />
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
