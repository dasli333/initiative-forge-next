import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion } from "@/components/ui/accordion";
import { Search, Loader2 } from "lucide-react";
import { TypeFilter } from "@/components/monsters/TypeFilter";
import { useLanguageStore } from "@/stores/languageStore";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { MonsterCard } from "./step3/MonsterCard";
import { AddedMonsterItem } from "./step3/AddedMonsterItem";
import type { Step3Props } from "./types";

export function Step3_AddMonsters({
  searchTerm,
  typeFilter,
  monsters,
  addedMonsters,
  onSearchChange,
  onTypeFilterChange,
  onAddMonster,
  onUpdateCount,
  onRemoveMonster,
  onLoadMore,
  hasMore,
  isLoading,
  onBack,
  onNext,
}: Step3Props) {
  // Language store for monster names
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);

  // Infinite scroll hook
  const { ref: loadMoreRef } = useInfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading,
    threshold: 0.1,
  });

  return (
    <div className="max-w-7xl mx-auto">
      <h2 id="step-3-heading" className="text-2xl font-bold mb-6" tabIndex={-1}>
        Add Monsters
      </h2>

      <p className="text-muted-foreground mb-6">Search and add monsters from the library to your combat.</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Monster Library (60%) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search, Filter and Language Switch */}
          <div className="flex gap-4">
            <div className="flex-1 max-w-md space-y-2">
              <Label htmlFor="monster-search" className="text-sm font-medium">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="monster-search"
                  data-testid="monster-search-input"
                  type="text"
                  placeholder="Search monsters..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-48">
              <TypeFilter value={typeFilter} onChange={onTypeFilterChange} />
            </div>

            <div className="flex items-end gap-2 pb-0.5">
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

          {/* Monster List */}
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="max-h-[600px] overflow-y-auto">
              {monsters.length === 0 && !isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  No monsters found. Try adjusting your search or filters.
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {monsters.map((monster) => (
                    <MonsterCard key={monster.id} monster={monster} onAdd={onAddMonster} />
                  ))}
                </Accordion>
              )}

              {/* Loading indicator / Load more trigger */}
              {hasMore && (
                <div ref={loadMoreRef} className="p-4 flex justify-center">
                  {isLoading && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Added Monsters (40%) */}
        <div className="lg:col-span-2">
          <div className="sticky top-4 border border-border rounded-lg p-4 bg-card shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Added to Combat</h3>

            {addedMonsters.size === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">No monsters added yet</p>
                <p className="text-xs mt-1">Click the + button to add monsters</p>
              </div>
            ) : (
              <div className="space-y-2">
                {Array.from(addedMonsters.values()).map((monster) => (
                  <AddedMonsterItem
                    key={monster.monster_id}
                    monster={monster}
                    onUpdateCount={onUpdateCount}
                    onRemove={onRemoveMonster}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button data-testid="wizard-back-button" onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <Button data-testid="wizard-next-button" onClick={onNext} size="lg">
          Next
        </Button>
      </div>
    </div>
  );
}
