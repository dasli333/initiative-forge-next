'use client';

import { useState } from "react";
import { SpellsHeader } from "./SpellsHeader";
import { SpellList } from "./SpellList";
import { SpellDetails } from "./SpellDetails";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue";
import { useSpells } from "@/components/hooks/useSpells";
import { useLanguageStore } from "@/stores/languageStore";
import { FileSearch } from "lucide-react";
import { getSpellLevelInfo } from "@/lib/constants/spells";
import { cn } from "@/lib/utils";

/**
 * Main container component for the Spells Library view
 * Manages all state and orchestrates child components
 *
 * Features:
 * - Split-view layout (30% list, 70% details)
 * - Search by spell name (debounced 300ms)
 * - Filter by level (0-9), class
 * - Infinite scroll pagination in list
 * - Fixed detail view on the right
 * - React Query for server state management
 *
 * State management:
 * - Local state: filters (search, level, class), selected spell
 * - Server state: React Query (spells data, loading, error, pagination)
 */
export function SpellsLibraryView() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [level, setLevel] = useState<number | null>(null);
  const [className, setClassName] = useState<string | null>(null);

  // Debounced search query to reduce API calls
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  // Selected spell state
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);

  // Get selected language from store
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);

  // Fetch spells with React Query infinite query
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useSpells({
    searchQuery: debouncedSearchQuery,
    level,
    class: className,
    limit: 30,
  });

  // Flatten paginated data into single array
  const spells = data?.pages.flatMap((page) => page.spells) ?? [];

  // Find selected spell from loaded data
  const selectedSpell = spells.find((s) => s.id === selectedSpellId) ?? null;

  /**
   * Handlers
   */

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleLevelChange = (newLevel: number | null) => {
    setLevel(newLevel);
  };

  const handleClassChange = (newClass: string | null) => {
    setClassName(newClass);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setLevel(null);
    setClassName(null);
  };

  const handleSpellClick = (spellId: string) => {
    setSelectedSpellId(spellId);
  };

  return (
    <div className="flex h-full -m-4 md:-m-8">
      {/* Left Panel - Spell List (minimum 500px to fit filters, 30% width on larger screens) */}
      <div className="min-w-[500px] w-[30%] border-r border-border flex flex-col">
        {/* Header with filters - fixed at top of left panel */}
        <div className="p-4 border-b border-border">
          <SpellsHeader
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            level={level}
            onLevelChange={handleLevelChange}
            class={className}
            onClassChange={handleClassChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Scrollable spell list */}
        <div className="flex-1 overflow-y-auto">
          <SpellList
            spells={spells}
            selectedSpellId={selectedSpellId}
            isLoading={isLoading}
            isError={isError}
            onSpellClick={handleSpellClick}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
            refetch={refetch}
          />
        </div>
      </div>

      {/* Right Panel - Spell Details (70% width) */}
      <div className="w-[70%] flex flex-col">
        {selectedSpell ? (
          <>
            {/* Spell header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-card via-card/80 to-emerald-500/5">
              <h2 className="text-3xl font-bold mb-3">{selectedSpell.data.name[selectedLanguage]}</h2>
              {selectedLanguage === "en" && selectedSpell.data.name.pl !== selectedSpell.data.name.en && (
                <p className="text-sm text-muted-foreground italic mb-3">{selectedSpell.data.name.pl}</p>
              )}
              {selectedLanguage === "pl" && selectedSpell.data.name.en !== selectedSpell.data.name.pl && (
                <p className="text-sm text-muted-foreground italic mb-3">{selectedSpell.data.name.en}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={cn("px-3 py-1 text-sm shadow-sm border", getSpellLevelInfo(selectedSpell.data.level, selectedSpell.data.isCantrip).color)}>
                  {getSpellLevelInfo(selectedSpell.data.level, selectedSpell.data.isCantrip).label}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  {selectedSpell.data.school}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  {selectedSpell.data.castingTime.time}
                </Badge>
                {selectedSpell.data.duration.concentration && (
                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                    Concentration
                  </Badge>
                )}
              </div>
            </div>

            {/* Scrollable spell details */}
            <ScrollArea className="flex-1 p-6">
              <SpellDetails data={selectedSpell.data} />
            </ScrollArea>
          </>
        ) : (
          // Empty state when no spell is selected
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <FileSearch className="h-16 w-16 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Spell Selected</h3>
            <p className="text-sm">Select a spell from the list to view its details</p>
          </div>
        )}
      </div>
    </div>
  );
}
