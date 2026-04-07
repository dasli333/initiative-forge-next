import { useState, useRef, useEffect, useCallback } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/stores/languageStore";
import { useCombatStore } from "@/stores/useCombatStore";
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue";
import { useMonsters } from "@/components/hooks/useMonsters";
import { getChallengeRatingColor } from "@/lib/constants/monsters";
import { createMonsterParticipants } from "@/lib/combat/monster-to-participant";
import { TypeFilter } from "@/components/monsters/TypeFilter";
import { CompactMonsterDetails } from "./CompactMonsterDetails";
import type { MonsterDTO } from "@/types";

interface MonstersTabProps {
  searchTerm: string;
}

export function MonstersTab({ searchTerm }: MonstersTabProps) {
  const [type, setType] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const participants = useCombatStore((s) => s.participants);
  const addParticipants = useCombatStore((s) => s.addParticipants);
  const saveSnapshot = useCombatStore((s) => s.saveSnapshot);
  const observerTarget = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useMonsters({
    searchQuery: debouncedSearch,
    type,
    size: null,
    alignment: null,
    limit: 20,
  });

  const monsters = data?.pages.flatMap((page) => page.monsters) ?? [];

  const getCount = (monsterId: string) => counts[monsterId] ?? 1;

  const setCount = (monsterId: string, value: number) => {
    const clamped = Math.max(1, Math.min(10, value));
    setCounts((prev) => ({ ...prev, [monsterId]: clamped }));
  };

  const handleAdd = async (monster: MonsterDTO) => {
    const count = getCount(monster.id);
    const newParticipants = createMonsterParticipants(monster, count, participants);
    addParticipants(newParticipants);

    const name = monster.data.name[selectedLanguage];
    toast.success(count > 1 ? `Added ${count}x ${name} to combat` : `Added ${name} to combat`);

    try {
      await saveSnapshot();
    } catch {
      toast.error("Failed to save combat state");
    }
  };

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(handleObserver, { threshold: 0.8 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [handleObserver]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 space-y-2">
        <p className="text-sm text-destructive">Failed to load monsters</p>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RotateCcw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 min-w-0">
          <TypeFilter value={type} onChange={setType} />
        </div>
        {type !== null && (
          <Button variant="ghost" size="sm" className="flex-shrink-0 h-9 px-2" onClick={() => setType(null)}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Monster list */}
      {monsters.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No monsters found</p>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {monsters.map((monster) => {
            const crColor = getChallengeRatingColor(monster.data.challengeRating.rating);
            return (
              <AccordionItem key={monster.id} value={monster.id}>
                <AccordionTrigger className="text-left py-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {monster.data.name[selectedLanguage]}
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge className={cn("text-[10px] px-1 py-0 shadow-sm border", crColor)}>
                        CR {monster.data.challengeRating.rating}
                      </Badge>
                      <span className="text-[10px] bg-muted/40 px-1 py-0.5 rounded">
                        {monster.data.type}
                      </span>
                      <span className="text-[10px] bg-muted/40 px-1 py-0.5 rounded">
                        {monster.data.size}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CompactMonsterDetails data={monster.data} />

                  {/* Add to Combat */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={getCount(monster.id)}
                      onChange={(e) => setCount(monster.id, parseInt(e.target.value) || 1)}
                      className="w-16 h-8 text-xs text-center"
                    />
                    <Button size="sm" className="h-8 flex-1 text-xs" onClick={() => handleAdd(monster)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add to Combat
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={observerTarget} className="py-2">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
