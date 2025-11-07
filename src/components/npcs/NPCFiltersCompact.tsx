'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
 * Compact filters for NPCs list
 * Displays small dropdown selects for faction, location, status, and tags
 */
export function NPCFiltersCompact({
  filters,
  onFiltersChange,
  factions,
  locations,
  tags,
}: NPCFiltersCompactProps) {
  const hasActiveFilters =
    filters.faction_id ||
    filters.current_location_id ||
    filters.status ||
    (filters.tag_ids && filters.tag_ids.length > 0);

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  // Get selected tag for display
  const selectedTag = filters.tag_ids?.[0]
    ? tags.find((t) => t.id === filters.tag_ids![0])
    : null;

  return (
    <div className="space-y-2">
      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        {/* Faction filter */}
        <Select
          value={filters.faction_id || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              faction_id: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Faction" />
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

        {/* Location filter */}
        <Select
          value={filters.current_location_id || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              current_location_id: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Location" />
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

        {/* Status filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status: value === 'all' ? undefined : (value as 'alive' | 'dead' | 'unknown'),
            })
          }
        >
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="alive">Alive</SelectItem>
            <SelectItem value="dead">Dead</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>

        {/* Tag filter */}
        <Select
          value={filters.tag_ids?.[0] || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              tag_ids: value === 'all' ? undefined : [value],
            })
          }
        >
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Tag" />
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

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filters chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {filters.faction_id && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-accent border">
              <span className="text-muted-foreground">Faction:</span>
              <span>{factions.find((f) => f.id === filters.faction_id)?.name}</span>
              <button
                onClick={() => onFiltersChange({ ...filters, faction_id: undefined })}
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
                onClick={() => onFiltersChange({ ...filters, current_location_id: undefined })}
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
                onClick={() => onFiltersChange({ ...filters, status: undefined })}
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
                onClick={() => onFiltersChange({ ...filters, tag_ids: undefined })}
                className="hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
