import { useState, useRef, useEffect, useCallback } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/stores/languageStore";
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue";
import { useSpells } from "@/components/hooks/useSpells";
import { getSpellLevelInfo } from "@/lib/constants/spells";
import { LevelFilter } from "@/components/spells/LevelFilter";
import { ClassFilter } from "@/components/spells/ClassFilter";
import { CompactSpellDetails } from "./CompactSpellDetails";

interface SpellsTabProps {
  searchTerm: string;
}

export function SpellsTab({ searchTerm }: SpellsTabProps) {
  const [level, setLevel] = useState<number | null>(null);
  const [className, setClassName] = useState<string | null>(null);
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const observerTarget = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useSpells({
    searchQuery: debouncedSearch,
    level,
    class: className,
    limit: 20,
  });

  const spells = data?.pages.flatMap((page) => page.spells) ?? [];
  const hasFilters = level !== null || className !== null;

  const resetFilters = () => {
    setLevel(null);
    setClassName(null);
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
        <p className="text-sm text-destructive">Failed to load spells</p>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RotateCcw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 min-w-0">
          <LevelFilter value={level} onChange={setLevel} />
        </div>
        <div className="flex-1 min-w-0">
          <ClassFilter value={className} onChange={setClassName} />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="flex-shrink-0 h-9 px-2" onClick={resetFilters}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Spell list */}
      {spells.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No spells found</p>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {spells.map((spell) => {
            const levelInfo = getSpellLevelInfo(spell.data.level, spell.data.isCantrip);
            return (
              <AccordionItem key={spell.id} value={spell.id}>
                <AccordionTrigger className="text-left py-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {spell.data.name[selectedLanguage]}
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge className={cn("text-[10px] px-1 py-0 shadow-sm border", levelInfo.color)}>
                        {levelInfo.label}
                      </Badge>
                      <span className="text-[10px] bg-muted/40 px-1 py-0.5 rounded">
                        {spell.data.school}
                      </span>
                      <span className="text-[10px] bg-muted/40 px-1 py-0.5 rounded">
                        {spell.data.castingTime.time}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CompactSpellDetails data={spell.data} />
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
