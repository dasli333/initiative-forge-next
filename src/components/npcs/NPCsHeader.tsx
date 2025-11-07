'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import type { NPCFilters } from '@/types/npcs';

interface NPCsHeaderProps {
  campaignName: string;
  factions: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  filters: NPCFilters;
  onFilterChange: (filters: NPCFilters) => void;
  onAddClick: () => void;
}

/**
 * Header component for NPCs page
 * - Breadcrumb: My Campaigns → [Campaign Name] → NPCs
 * - H1: "NPCs"
 * - Filters (inline):
 *   - FactionMultiSelect (multi-select dropdown with badges)
 *   - LocationSelect (single select)
 *   - StatusSelect (alive/dead/unknown)
 * - "Add NPC" button (emerald variant)
 */
export function NPCsHeader({
  campaignName,
  factions,
  locations,
  filters,
  onFilterChange,
  onAddClick,
}: NPCsHeaderProps) {

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <a href="/campaigns" className="hover:text-foreground transition-colors">
          My Campaigns
        </a>
        <span>→</span>
        <span className="text-foreground">{campaignName}</span>
        <span>→</span>
        <span className="text-foreground font-medium">NPCs</span>
      </nav>

      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">NPCs</h1>
        <Button onClick={onAddClick} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add NPC
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Faction Filter */}
        <div>
          <Select
            value={filters.faction_id || 'all'}
            onValueChange={(value) =>
              onFilterChange({
                ...filters,
                faction_id: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All factions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All factions</SelectItem>
              <SelectItem value="none">No faction</SelectItem>
              {factions.map((faction) => (
                <SelectItem key={faction.id} value={faction.id}>
                  {faction.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div>
          <Select
            value={filters.current_location_id || 'all'}
            onValueChange={(value) =>
              onFilterChange({
                ...filters,
                current_location_id: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              <SelectItem value="none">No location</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              onFilterChange({
                ...filters,
                status: value === 'all' ? undefined : (value as 'alive' | 'dead' | 'unknown'),
              })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="alive">Alive</SelectItem>
              <SelectItem value="dead">Dead</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {(filters.faction_id || filters.current_location_id || filters.status) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange({})}
            className="h-9"
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
