import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Plus, X, Loader2 } from "lucide-react";
import { TypeFilter } from "@/components/monsters/TypeFilter";
import { useLanguageStore } from "@/stores/languageStore";
import type { Step3Props, MonsterViewModel, AddedMonsterViewModel } from "./types";

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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

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

// Monster Card Component
function MonsterCard({
  monster,
  onAdd,
}: {
  monster: MonsterViewModel;
  onAdd: (monsterId: string, monsterName: string) => void;
}) {
  return (
    <AccordionItem data-testid={`monster-card-${monster.name}`} value={monster.id} className="border-border">
      <div className="flex items-center justify-between pr-4 hover:bg-accent/50 transition-colors">
        <AccordionTrigger className="flex-1 hover:no-underline px-4 py-3">
          <div className="flex items-center gap-3 text-left flex-wrap">
            <span className="font-medium">{monster.name}</span>
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-0.5 text-xs shadow-sm">
              CR {monster.cr}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {monster.size} {monster.type}
            </span>
          </div>
        </AccordionTrigger>
        <Button
          data-testid={`add-monster-${monster.name}`}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(monster.id, monster.name);
          }}
          className="ml-2"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <AccordionContent className="px-4 pb-4 bg-muted/30">
        <div className="space-y-3 text-sm">
          <div className="flex gap-4 flex-wrap">
            <div>
              <span className="font-medium">HP:</span> <span className="text-muted-foreground">{monster.hp}</span>
            </div>
            <div>
              <span className="font-medium">AC:</span> <span className="text-muted-foreground">{monster.ac}</span>
            </div>
            <div>
              <span className="font-medium">Speed:</span>{" "}
              <span className="text-muted-foreground">{monster.speed.join(", ")}</span>
            </div>
          </div>

          {monster.actions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Actions</h4>
              <ul className="space-y-1">
                {monster.actions.slice(0, 3).map((action, idx) => (
                  <li key={idx} className="text-muted-foreground">
                    <span className="font-medium text-foreground">{action.name}:</span> {action.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// Added Monster Item Component
function AddedMonsterItem({
  monster,
  onUpdateCount,
  onRemove,
}: {
  monster: AddedMonsterViewModel;
  onUpdateCount: (monsterId: string, count: number) => void;
  onRemove: (monsterId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(monster.count.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCountClick = useCallback(() => {
    setIsEditing(true);
    setEditValue(monster.count.toString());
  }, [monster.count]);

  const handleCountSubmit = useCallback(() => {
    const newCount = parseInt(editValue, 10);
    if (!isNaN(newCount) && newCount >= 1) {
      onUpdateCount(monster.monster_id, newCount);
    } else {
      setEditValue(monster.count.toString());
    }
    setIsEditing(false);
  }, [editValue, monster.count, monster.monster_id, onUpdateCount]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleCountSubmit();
      } else if (e.key === "Escape") {
        setIsEditing(false);
        setEditValue(monster.count.toString());
      }
    },
    [handleCountSubmit, monster.count]
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-card via-card/80 to-emerald-500/5 rounded-lg border border-border shadow-sm">
      <div className="flex-1">
        <span className="font-medium">{monster.name}</span>
      </div>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <Input
            ref={inputRef}
            data-testid={`monster-count-${monster.name}`}
            type="number"
            min="1"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCountSubmit}
            onKeyDown={handleKeyDown}
            className="w-16 h-8 text-center"
          />
        ) : (
          <Badge data-testid={`monster-count-${monster.name}`} variant="secondary" className="cursor-pointer hover:bg-accent" onClick={handleCountClick}>
            x{monster.count}
          </Badge>
        )}

        <Button size="sm" variant="ghost" onClick={() => onRemove(monster.monster_id)} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
          <span className="sr-only">Remove {monster.name}</span>
        </Button>
      </div>
    </div>
  );
}
