'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EQUIPMENT_GROUPS } from '@/lib/constants/equipment';

interface CategoryFilterProps {
  /** Current selected category (null for all) */
  value: string | null;
  /** Callback when category changes */
  onChange: (category: string | null) => void;
}

/**
 * Dropdown filter for equipment categories
 * Uses grouped list of D&D 5e equipment categories
 */
export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const handleValueChange = (newValue: string) => {
    onChange(newValue === 'all' ? null : newValue);
  };

  return (
    <div className="space-y-1">
      <Label htmlFor="category-filter" className="text-xs text-muted-foreground">
        Category
      </Label>
      <Select value={value ?? 'all'} onValueChange={handleValueChange}>
        <SelectTrigger id="category-filter" className="min-w-[200px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {EQUIPMENT_GROUPS.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel className="flex items-center gap-2">
                <group.icon className="h-4 w-4" />
                {group.label}
              </SelectLabel>
              {group.items.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
