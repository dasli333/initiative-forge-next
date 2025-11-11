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
import { Filter, X } from 'lucide-react';
import type { StoryArcFilters } from '@/types/story-arcs';

interface StoryArcsFiltersCompactProps {
  filters: StoryArcFilters;
  onFiltersChange: (filters: StoryArcFilters) => void;
}

export function StoryArcsFiltersCompact({
  filters,
  onFiltersChange,
}: StoryArcsFiltersCompactProps) {
  const activeFilterCount = useMemo(() => {
    return filters.status ? 1 : 0;
  }, [filters]);

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      onFiltersChange({});
    } else {
      onFiltersChange({ status: value as 'planning' | 'active' | 'completed' | 'abandoned' });
    }
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
              <RadioGroupItem value="planning" id="status-planning" />
              <Label htmlFor="status-planning" className="font-normal">
                Planning
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
              <RadioGroupItem value="abandoned" id="status-abandoned" />
              <Label htmlFor="status-abandoned" className="font-normal">
                Abandoned
              </Label>
            </div>
          </RadioGroup>
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
                    onClick={() => onFiltersChange({})}
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
