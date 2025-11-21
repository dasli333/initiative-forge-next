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
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X } from 'lucide-react';
import { LORE_NOTE_CATEGORIES, type LoreNoteCategory, type LoreNoteFilters } from '@/types/lore-notes';

interface LoreNoteFiltersCompactProps {
  filters: LoreNoteFilters;
  onFiltersChange: (filters: LoreNoteFilters) => void;
  availableTags: string[]; // All unique tags from campaign's lore notes
}

export function LoreNoteFiltersCompact({
  filters,
  onFiltersChange,
  availableTags,
}: LoreNoteFiltersCompactProps) {
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.tags && filters.tags.length > 0) count += filters.tags.length;
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

  const handleTagToggle = (tag: string, checked: boolean) => {
    const currentTags = filters.tags || [];
    if (checked) {
      onFiltersChange({ ...filters, tags: [...currentTags, tag] });
    } else {
      onFiltersChange({ ...filters, tags: currentTags.filter((t) => t !== tag) });
    }
  };

  const removeFilter = (key: keyof LoreNoteFilters, value?: string) => {
    if (key === 'tags' && value) {
      const newTags = (filters.tags || []).filter((t) => t !== value);
      if (newTags.length === 0) {
        const { tags: _tags, ...rest } = filters;
        onFiltersChange(rest);
      } else {
        onFiltersChange({ ...filters, tags: newTags });
      }
    } else {
      const { [key]: _, ...rest } = filters;
      onFiltersChange(rest);
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

        {/* Tags filter */}
        {availableTags.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label>Tags</Label>
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={(filters.tags || []).includes(tag)}
                    onCheckedChange={(checked) => handleTagToggle(tag, checked as boolean)}
                  />
                  <Label htmlFor={`tag-${tag}`} className="font-normal cursor-pointer">
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

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
                    onClick={() => removeFilter('category')}
                  />
                </Badge>
              )}
              {filters.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter('tags', tag)}
                  />
                </Badge>
              ))}
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
