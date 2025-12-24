'use client';

import { useState } from "react";
import { MonstersHeader } from "./MonstersHeader";
import { MonsterList } from "./MonsterList";
import { MonsterDetails } from "./MonsterDetails";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue";
import { useMonsters } from "@/components/hooks/useMonsters";
import { useLanguageStore } from "@/stores/languageStore";
import { FileSearch } from "lucide-react";
import { getChallengeRatingColor } from "@/lib/constants/monsters";
import { cn } from "@/lib/utils";

/**
 * Main container component for the Monsters Library view
 * Manages all state and orchestrates child components
 *
 * Features:
 * - Split-view layout (30% list, 70% details)
 * - Search by monster name (debounced 300ms)
 * - Filter by type, size, alignment
 * - Infinite scroll pagination in list
 * - Fixed detail view on the right
 * - React Query for server state management
 *
 * State management:
 * - Local state: filters (search, type, size, alignment), selected monster
 * - Server state: React Query (monsters data, loading, error, pagination)
 */
export function MonstersLibraryView() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [type, setType] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [alignment, setAlignment] = useState<string | null>(null);

  // Debounced search query to reduce API calls
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  // Selected monster state
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);

  // Get selected language from store
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);

  // Fetch monsters with React Query infinite query
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useMonsters({
    searchQuery: debouncedSearchQuery,
    type,
    size,
    alignment,
    limit: 30,
  });

  // Flatten paginated data into single array
  const monsters = data?.pages.flatMap((page) => page.monsters) ?? [];

  // Find selected monster from loaded data
  const selectedMonster = monsters.find((m) => m.id === selectedMonsterId) ?? null;

  /**
   * Handlers
   */

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleTypeChange = (newType: string | null) => {
    setType(newType);
  };

  const handleSizeChange = (newSize: string | null) => {
    setSize(newSize);
  };

  const handleAlignmentChange = (newAlignment: string | null) => {
    setAlignment(newAlignment);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setType(null);
    setSize(null);
    setAlignment(null);
  };

  const handleMonsterClick = (monsterId: string) => {
    setSelectedMonsterId(monsterId);
  };

  return (
    <div className="flex h-full -m-4 md:-m-8">
      {/* Left Panel - Monster List (minimum 500px to fit filters, 30% width on larger screens) */}
      <div className="min-w-[500px] w-[30%] border-r border-border flex flex-col">
        {/* Header with filters - fixed at top of left panel */}
        <div className="p-4 border-b border-border">
          <MonstersHeader
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            type={type}
            onTypeChange={handleTypeChange}
            size={size}
            onSizeChange={handleSizeChange}
            alignment={alignment}
            onAlignmentChange={handleAlignmentChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Scrollable monster list */}
        <div className="flex-1 overflow-y-auto">
          <MonsterList
            monsters={monsters}
            selectedMonsterId={selectedMonsterId}
            isLoading={isLoading}
            isError={isError}
            onMonsterClick={handleMonsterClick}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
            refetch={refetch}
          />
        </div>
      </div>

      {/* Right Panel - Monster Details (70% width) */}
      <div className="w-[70%] flex flex-col">
        {selectedMonster ? (
          <>
            {/* Monster header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-card via-card/80 to-emerald-500/5">
              <h2 className="text-3xl font-bold mb-3">{selectedMonster.data.name[selectedLanguage]}</h2>
              {selectedLanguage === "en" && selectedMonster.data.name.pl !== selectedMonster.data.name.en && (
                <p className="text-sm text-muted-foreground italic mb-3">{selectedMonster.data.name.pl}</p>
              )}
              {selectedLanguage === "pl" && selectedMonster.data.name.en !== selectedMonster.data.name.pl && (
                <p className="text-sm text-muted-foreground italic mb-3">{selectedMonster.data.name.en}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={cn("px-3 py-1 text-sm shadow-sm border", getChallengeRatingColor(selectedMonster.data.challengeRating.rating))}>
                  CR {selectedMonster.data.challengeRating.rating}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  {selectedMonster.data.type}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  {selectedMonster.data.size}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  {selectedMonster.data.alignment}
                </Badge>
              </div>
            </div>

            {/* Scrollable monster details */}
            <ScrollArea className="flex-1 p-6">
              <MonsterDetails data={selectedMonster.data} />
            </ScrollArea>
          </>
        ) : (
          // Empty state when no monster is selected
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <FileSearch className="h-16 w-16 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Monster Selected</h3>
            <p className="text-sm">Select a monster from the list to view its details</p>
          </div>
        )}
      </div>
    </div>
  );
}
