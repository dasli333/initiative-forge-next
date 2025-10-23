import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SearchBar } from "../monsters/SearchBar";
import { LevelFilter } from "./LevelFilter";
import { ClassFilter } from "./ClassFilter";
import { useLanguageStore } from "@/stores/languageStore";

/**
 * Props for SpellsHeader component
 */
interface SpellsHeaderProps {
  /**
   * Current search query value
   */
  searchQuery: string;
  /**
   * Callback fired when search query changes
   */
  onSearchChange: (query: string) => void;
  /**
   * Current level filter (0-9, null for all)
   */
  level: number | null;
  /**
   * Callback fired when level filter changes
   */
  onLevelChange: (level: number | null) => void;
  /**
   * Current class filter
   */
  class: string | null;
  /**
   * Callback fired when class filter changes
   */
  onClassChange: (className: string | null) => void;
  /**
   * Callback fired when reset filters button is clicked
   */
  onResetFilters: () => void;
}

/**
 * Header section of the Spells Library view
 * Contains title, search bar, all filters, and reset button
 *
 * @param props - Component props
 */
export function SpellsHeader({
  searchQuery,
  onSearchChange,
  level,
  onLevelChange,
  class: className,
  onClassChange,
  onResetFilters,
}: SpellsHeaderProps) {
  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() !== "" || level !== null || className !== null;

  // Language store for switching between EN/PL
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);

  return (
    <header className="space-y-4 mb-6">
      {/* Title and Language Switch */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Spells Library</h1>

        {/* Language Switch */}
        <div className="flex items-center gap-2">
          <Label htmlFor="language-switch" className="text-sm font-medium cursor-pointer">
            {selectedLanguage === "en" ? "EN" : "PL"}
          </Label>
          <Switch
            id="language-switch"
            checked={selectedLanguage === "pl"}
            onCheckedChange={toggleLanguage}
            aria-label="Toggle language between English and Polish"
          />
        </div>
      </div>

      {/* Search bar - full width */}
      <SearchBar value={searchQuery} onChange={onSearchChange} placeholder="Search spells..." />

      {/* Filters row */}
      <div className="space-y-4">
        {/* Filters in a row with consistent spacing */}
        <div className="flex flex-wrap gap-3">
          <LevelFilter value={level} onChange={onLevelChange} />
          <ClassFilter value={className} onChange={onClassChange} />
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
