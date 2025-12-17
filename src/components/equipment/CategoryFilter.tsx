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

/**
 * Equipment categories grouped by type
 */
const EQUIPMENT_GROUPS = [
  {
    label: 'Weapons',
    items: [
      { id: 'weapons', label: 'All Weapons' },
      { id: 'simple-melee-weapons', label: 'Simple Melee Weapons' },
      { id: 'simple-ranged-weapons', label: 'Simple Ranged Weapons' },
      { id: 'martial-melee-weapons', label: 'Martial Melee Weapons' },
      { id: 'martial-ranged-weapons', label: 'Martial Ranged Weapons' },
    ],
  },
  {
    label: 'Armor',
    items: [
      { id: 'armor', label: 'All Armor' },
      { id: 'light-armor', label: 'Light Armor' },
      { id: 'medium-armor', label: 'Medium Armor' },
      { id: 'heavy-armor', label: 'Heavy Armor' },
      { id: 'shields', label: 'Shields' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { id: 'tools', label: 'All Tools' },
      { id: 'artisans-tools', label: "Artisan's Tools" },
      { id: 'gaming-sets', label: 'Gaming Sets' },
      { id: 'musical-instruments', label: 'Musical Instruments' },
      { id: 'kits', label: 'Kits' },
    ],
  },
  {
    label: 'Other',
    items: [
      { id: 'adventuring-gear', label: 'Adventuring Gear' },
      { id: 'ammunition', label: 'Ammunition' },
      { id: 'equipment-packs', label: 'Equipment Packs' },
    ],
  },
] as const;

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
              <SelectLabel>{group.label}</SelectLabel>
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
