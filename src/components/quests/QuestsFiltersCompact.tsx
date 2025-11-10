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
import type { QuestFilters } from '@/types/quests';
import type { StoryArcDTO } from '@/types/story-arcs';

interface QuestsFiltersCompactProps {
  filters: QuestFilters;
  storyArcs: StoryArcDTO[];
  onFiltersChange: (filters: QuestFilters) => void;
}

export function QuestsFiltersCompact({
  filters,
  storyArcs,
  onFiltersChange,
}: QuestsFiltersCompactProps) {
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.quest_type) count++;
    if (filters.story_arc_id) count++;
    return count;
  }, [filters]);

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      const { status, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, status: value as 'not_started' | 'active' | 'completed' | 'failed' });
    }
  };

  const handleQuestTypeChange = (value: string) => {
    if (value === 'all') {
      const { quest_type, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, quest_type: value as 'main' | 'side' });
    }
  };

  const handleStoryArcChange = (value: string) => {
    if (value === 'all') {
      const { story_arc_id, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, story_arc_id: value });
    }
  };

  const removeFilter = (key: keyof QuestFilters) => {
    const { [key]: _, ...rest } = filters;
    onFiltersChange(rest);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

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
        {/* Status filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <RadioGroup
            value={filters.status || 'all'}
            onValueChange={handleStatusChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="status-all" />
              <Label htmlFor="status-all" className="font-normal">
                All statuses
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not_started" id="status-not-started" />
              <Label htmlFor="status-not-started" className="font-normal">
                Not Started
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="status-active" />
              <Label htmlFor="status-active" className="font-normal">
                Active
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completed" id="status-completed" />
              <Label htmlFor="status-completed" className="font-normal">
                Completed
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="failed" id="status-failed" />
              <Label htmlFor="status-failed" className="font-normal">
                Failed
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Quest Type filter */}
        <div className="mt-4 space-y-2">
          <Label>Quest Type</Label>
          <RadioGroup
            value={filters.quest_type || 'all'}
            onValueChange={handleQuestTypeChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="type-all" />
              <Label htmlFor="type-all" className="font-normal">
                All types
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="main" id="type-main" />
              <Label htmlFor="type-main" className="font-normal">
                Main Quests
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="side" id="type-side" />
              <Label htmlFor="type-side" className="font-normal">
                Side Quests
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Story Arc filter */}
        <div className="mt-4 space-y-2">
          <Label>Story Arc</Label>
          <Select
            value={filters.story_arc_id || 'all'}
            onValueChange={handleStoryArcChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All story arcs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All story arcs</SelectItem>
              {storyArcs.map((arc) => (
                <SelectItem key={arc.id} value={arc.id}>
                  {arc.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active filters chips */}
        {activeFilterCount > 0 && (
          <div className="mt-4 space-y-2 border-t pt-4">
            <div className="text-sm font-medium">Active Filters:</div>
            <div className="flex flex-wrap gap-1.5">
              {filters.status && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filters.status}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter('status')}
                  />
                </Badge>
              )}
              {filters.quest_type && (
                <Badge variant="secondary" className="gap-1">
                  Type: {filters.quest_type}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter('quest_type')}
                  />
                </Badge>
              )}
              {filters.story_arc_id && (
                <Badge variant="secondary" className="gap-1">
                  Arc: {storyArcs.find((a) => a.id === filters.story_arc_id)?.title}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter('story_arc_id')}
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
