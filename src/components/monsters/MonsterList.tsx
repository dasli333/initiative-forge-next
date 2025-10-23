import { useEffect, useRef } from "react";
import { AlertCircle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonsterListItem } from "./MonsterListItem";
import { Skeleton } from "@/components/ui/skeleton";
import type { MonsterDTO } from "@/types";

/**
 * Props for MonsterList component
 */
interface MonsterListProps {
  /**
   * Array of monsters to display
   */
  monsters: MonsterDTO[];
  /**
   * ID of the currently selected monster
   */
  selectedMonsterId: string | null;
  /**
   * Whether initial data is loading
   */
  isLoading: boolean;
  /**
   * Whether an error occurred
   */
  isError: boolean;
  /**
   * Callback fired when a monster is clicked
   */
  onMonsterClick: (monsterId: string) => void;
  /**
   * Whether there are more pages to load
   */
  hasNextPage: boolean;
  /**
   * Whether the next page is currently being fetched
   */
  isFetchingNextPage: boolean;
  /**
   * Callback to load the next page (infinite scroll)
   */
  onLoadMore: () => void;
  /**
   * Optional refetch function for error recovery
   */
  refetch?: () => void;
}

/**
 * List container for displaying monsters with infinite scroll
 * Shows a compact vertical list suitable for the left panel
 *
 * @param props - Component props
 */
export function MonsterList({
  monsters,
  selectedMonsterId,
  isLoading,
  isError,
  onMonsterClick,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  refetch,
}: MonsterListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Set up Intersection Observer for infinite scroll
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Trigger load more when target is visible and conditions are met
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { threshold: 0.8 } // Trigger at 80% visibility
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  // Initial loading state
  if (isLoading && !isFetchingNextPage) {
    return (
      <div className="h-full">
        {/* Skeleton loading state */}
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="py-3 px-4 border-b border-border">
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (isError && monsters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mb-3" />
        <p className="text-sm font-semibold mb-1">Failed to load monsters</p>
        <p className="text-xs text-muted-foreground mb-3">Please try again</p>
        {refetch && (
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Empty state (no results)
  if (!isLoading && monsters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Search className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-sm font-semibold mb-1">No monsters found</p>
        <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
      </div>
    );
  }

  // Main list with monsters
  return (
    <div className="h-full">
      {monsters.map((monster) => (
        <MonsterListItem
          key={monster.id}
          monster={monster}
          isSelected={selectedMonsterId === monster.id}
          onClick={onMonsterClick}
        />
      ))}

      {/* Infinite scroll trigger element */}
      <div ref={observerTarget} className="py-4">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Loading more...</span>
          </div>
        )}
      </div>
    </div>
  );
}
