'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

/**
 * Equipment categories based on D&D 5e SRD
 * Flat list as per design decision
 */
const EQUIPMENT_CATEGORIES = [
  // Weapons
  { id: 'simple-melee-weapons', label: 'Simple Melee Weapons' },
  { id: 'simple-ranged-weapons', label: 'Simple Ranged Weapons' },
  { id: 'martial-melee-weapons', label: 'Martial Melee Weapons' },
  { id: 'martial-ranged-weapons', label: 'Martial Ranged Weapons' },
  // Armor
  { id: 'light-armor', label: 'Light Armor' },
  { id: 'medium-armor', label: 'Medium Armor' },
  { id: 'heavy-armor', label: 'Heavy Armor' },
  { id: 'shields', label: 'Shields' },
  // Tools
  { id: 'artisans-tools', label: "Artisan's Tools" },
  { id: 'gaming-sets', label: 'Gaming Sets' },
  { id: 'musical-instruments', label: 'Musical Instruments' },
  { id: 'kits', label: 'Kits' },
  // Other
  { id: 'adventuring-gear', label: 'Adventuring Gear' },
  { id: 'ammunition', label: 'Ammunition' },
  { id: 'equipment-packs', label: 'Equipment Packs' },
  { id: 'mounts-and-vehicles', label: 'Mounts and Vehicles' },
  { id: 'tack-harness-and-drawn-vehicles', label: 'Tack, Harness, and Drawn Vehicles' },
] as const;

interface CategoryFilterProps {
  /** Current selected category (null for all) */
  value: string | null;
  /** Callback when category changes */
  onChange: (category: string | null) => void;
}

/**
 * Dropdown filter for equipment categories
 * Uses flat list of all D&D 5e equipment categories
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
          {EQUIPMENT_CATEGORIES.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
