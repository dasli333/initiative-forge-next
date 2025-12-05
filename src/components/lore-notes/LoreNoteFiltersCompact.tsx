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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Filter, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { LORE_NOTE_CATEGORIES, type LoreNoteCategory, type LoreNoteFilters } from '@/types/lore-notes';
import type { LoreNoteTagDTO } from '@/types/lore-note-tags';
import { TagBadge } from '@/components/lore-notes/shared/TagBadge';

interface LoreNoteFiltersCompactProps {
  filters: LoreNoteFilters;
  onFiltersChange: (filters: LoreNoteFilters) => void;
  tags: LoreNoteTagDTO[]; // All tags from campaign
}

export function LoreNoteFiltersCompact({
  filters,
  onFiltersChange,
  tags,
}: LoreNoteFiltersCompactProps) {
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.tag_ids && filters.tag_ids.length > 0) count++;
    return count;
  }, [filters]);

  const handleCategoryChange = (value: string) => {
    if (value === 'all') {
      const { category: _category, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, category: value as LoreNoteCategory });
    }
  };

  const handleRemoveFilter = (filterKey: keyof LoreNoteFilters) => {
    onFiltersChange({ ...filters, [filterKey]: undefined });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  // Get selected tag for display
  const selectedTag = filters.tag_ids?.[0]
    ? tags.find((t) => t.id === filters.tag_ids![0])
    : null;

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
        {/* Category filter */}
        <div className="space-y-2">
          <Label>Category</Label>
          <RadioGroup
            value={filters.category || 'all'}
            onValueChange={handleCategoryChange}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="category-all" />
              <Label htmlFor="category-all" className="font-normal">
                All categories
              </Label>
            </div>
            {LORE_NOTE_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <RadioGroupItem value={category} id={`category-${category}`} />
                <Label htmlFor={`category-${category}`} className="font-normal">
                  {category}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Tag Filter */}
        <div className="mt-4 space-y-2">
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
              {tags.map((tag) => {
                const Icon = LucideIcons[tag.icon] || LucideIcons.Tag;
                return (
                  <SelectItem key={tag.id} value={tag.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-3 h-3" />
                      <span>{tag.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Active filters chips */}
        {activeFilterCount > 0 && (
          <div className="mt-4 space-y-2 border-t pt-4">
            <div className="text-sm font-medium">Active Filters:</div>
            <div className="flex flex-wrap gap-1.5">
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  {filters.category}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveFilter('category')}
                  />
                </Badge>
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
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="w-full">
              Clear all filters
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
