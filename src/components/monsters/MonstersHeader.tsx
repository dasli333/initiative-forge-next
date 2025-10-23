import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SearchBar } from "./SearchBar";
import { TypeFilter } from "./TypeFilter";
import { SizeFilter } from "./SizeFilter";
import { AlignmentFilter } from "./AlignmentFilter";
import { useLanguageStore } from "@/stores/languageStore";

/**
 * Props for MonstersHeader component
 */
interface MonstersHeaderProps {
  /**
   * Current search query value
   */
  searchQuery: string;
  /**
   * Callback fired when search query changes
   */
  onSearchChange: (query: string) => void;
  /**
   * Current type filter
   */
  type: string | null;
  /**
   * Callback fired when type filter changes
   */
  onTypeChange: (type: string | null) => void;
  /**
   * Current size filter
   */
  size: string | null;
  /**
   * Callback fired when size filter changes
   */
  onSizeChange: (size: string | null) => void;
  /**
   * Current alignment filter
   */
  alignment: string | null;
  /**
   * Callback fired when alignment filter changes
   */
  onAlignmentChange: (alignment: string | null) => void;
  /**
   * Callback fired when reset filters button is clicked
   */
  onResetFilters: () => void;
}

/**
 * Header section of the Monsters Library view
 * Contains title, search bar, all filters, and reset button
 *
 * @param props - Component props
 */
export function MonstersHeader({
  searchQuery,
  onSearchChange,
  type,
  onTypeChange,
  size,
  onSizeChange,
  alignment,
  onAlignmentChange,
  onResetFilters,
}: MonstersHeaderProps) {
  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() !== "" || type !== null || size !== null || alignment !== null;

  // Language store for switching between EN/PL
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);

  return (
    <header className="space-y-4 mb-6">
      {/* Title and Language Switch */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Monsters Library</h1>

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
      <SearchBar value={searchQuery} onChange={onSearchChange} />

      {/* Filters row */}
      <div className="space-y-4">
        {/* Filters in a row with consistent spacing */}
        <div className="flex flex-wrap gap-3">
          <TypeFilter value={type} onChange={onTypeChange} />
          <SizeFilter value={size} onChange={onSizeChange} />
          <AlignmentFilter value={alignment} onChange={onAlignmentChange} />
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
