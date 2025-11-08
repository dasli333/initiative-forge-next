'use client';

import { useMemo } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TagBadge } from './shared/TagBadge';
import type { NPCFilters } from '@/types/npcs';
import type { NPCTagDTO } from '@/types/npc-tags';

interface NPCFiltersCompactProps {
  filters: NPCFilters;
  onFiltersChange: (filters: NPCFilters) => void;
  factions: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  tags: NPCTagDTO[];
}

/**
 * Compact filters for NPCs list - Popover design
 * Single "Filters" button opens organized popover with all filter options
 */
export function NPCFiltersCompact({
  filters,
  onFiltersChange,
  factions,
  locations,
  tags,
}: NPCFiltersCompactProps) {
  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.faction_id) count++;
    if (filters.current_location_id) count++;
    if (filters.status) count++;
    if (filters.tag_ids && filters.tag_ids.length > 0) count++;
    return count;
  }, [filters]);

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const handleRemoveFilter = (filterKey: keyof NPCFilters) => {
    onFiltersChange({ ...filters, [filterKey]: undefined });
  };

  // Get selected tag for display
  const selectedTag = filters.tag_ids?.[0]
    ? tags.find((t) => t.id === filters.tag_ids![0])
    : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          {/* Faction Filter */}
          <div className="space-y-2">
            <Label htmlFor="faction-filter">Faction</Label>
            <Select
              value={filters.faction_id || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  faction_id: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger id="faction-filter" className="h-9">
                <SelectValue placeholder="All factions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All factions</SelectItem>
                {factions.map((faction) => (
                  <SelectItem key={faction.id} value={faction.id}>
                    {faction.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <Label htmlFor="location-filter">Location</Label>
            <Select
              value={filters.current_location_id || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  current_location_id: value === 'all' ? undefined : value,
                })
              }
            >
              <SelectTrigger id="location-filter" className="h-9">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <RadioGroup
              value={filters.status || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  status: value === 'all' ? undefined : (value as 'alive' | 'dead' | 'unknown'),
                })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="status-all" />
                <Label htmlFor="status-all" className="font-normal cursor-pointer">
                  All
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="alive" id="status-alive" />
                <Label htmlFor="status-alive" className="font-normal cursor-pointer">
                  Alive
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dead" id="status-dead" />
                <Label htmlFor="status-dead" className="font-normal cursor-pointer">
                  Dead
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unknown" id="status-unknown" />
                <Label htmlFor="status-unknown" className="font-normal cursor-pointer">
                  Unknown
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Tag Filter */}
          <div className="space-y-2">
            <Label htmlFor="tag-filter">Tag</Label>
            <Select
              value={filters.tag_ids?.[0] || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  tag_ids: value === 'all' ? undefined : [value],
                })
              }
            >
              <SelectTrigger id="tag-filter" className="h-9">
                <SelectValue placeholder="All tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="pt-2 border-t">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {filters.faction_id && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-accent border">
                    <span className="text-muted-foreground">Faction:</span>
                    <span>{factions.find((f) => f.id === filters.faction_id)?.name}</span>
                    <button
                      onClick={() => handleRemoveFilter('faction_id')}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.current_location_id && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-accent border">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{locations.find((l) => l.id === filters.current_location_id)?.name}</span>
                    <button
                      onClick={() => handleRemoveFilter('current_location_id')}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.status && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-accent border">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="capitalize">{filters.status}</span>
                    <button
                      onClick={() => handleRemoveFilter('status')}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedTag && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-accent border">
                    <span className="text-muted-foreground">Tag:</span>
                    <TagBadge tag={selectedTag} size="sm" />
                    <button
                      onClick={() => handleRemoveFilter('tag_ids')}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Clear All Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="w-full"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
