'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SearchBar } from '../monsters/SearchBar';
import { CategoryFilter } from './CategoryFilter';
import { useLanguageStore } from '@/stores/languageStore';

interface EquipmentHeaderProps {
  /** Current search query value */
  searchQuery: string;
  /** Callback fired when search query changes */
  onSearchChange: (query: string) => void;
  /** Current category filter (null for all) */
  category: string | null;
  /** Callback fired when category filter changes */
  onCategoryChange: (category: string | null) => void;
  /** Callback fired when reset filters button is clicked */
  onResetFilters: () => void;
}

/**
 * Header section of the Equipment Library view
 * Contains title, language switch, search bar, filters, and reset button
 */
export function EquipmentHeader({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  onResetFilters,
}: EquipmentHeaderProps) {
  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() !== '' || category !== null;

  // Language store for switching between EN/PL
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);

  return (
    <header className="space-y-4 mb-6">
      {/* Title and Language Switch */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Equipment Library</h1>

        {/* Language Switch */}
        <div className="flex items-center gap-2">
          <Label htmlFor="language-switch-equipment" className="text-sm font-medium cursor-pointer">
            {selectedLanguage === 'en' ? 'EN' : 'PL'}
          </Label>
          <Switch
            id="language-switch-equipment"
            checked={selectedLanguage === 'pl'}
            onCheckedChange={toggleLanguage}
            aria-label="Toggle language between English and Polish"
          />
        </div>
      </div>

      {/* Search bar - full width */}
      <SearchBar value={searchQuery} onChange={onSearchChange} placeholder="Search equipment..." />

      {/* Filters row */}
      <div className="space-y-4">
        {/* Category filter */}
        <div className="flex flex-wrap gap-3">
          <CategoryFilter value={category} onChange={onCategoryChange} />
        </div>

        {/* Reset filters button */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onResetFilters} size="sm">
            Reset all filters
          </Button>
        )}
      </div>
    </header>
  );
}
