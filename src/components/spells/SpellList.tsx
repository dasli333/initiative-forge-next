import { useEffect, useRef } from "react";
import { AlertCircle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpellListItem } from "./SpellListItem";
import { Skeleton } from "@/components/ui/skeleton";
import type { SpellDTO } from "@/types";

/**
 * Props for SpellList component
 */
interface SpellListProps {
  /**
   * Array of spells to display
   */
  spells: SpellDTO[];
  /**
   * ID of the currently selected spell
   */
  selectedSpellId: string | null;
  /**
   * Whether initial data is loading
   */
  isLoading: boolean;
  /**
   * Whether an error occurred
   */
  isError: boolean;
  /**
   * Callback fired when a spell is clicked
   */
  onSpellClick: (spellId: string) => void;
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
 * List container for displaying spells with infinite scroll
 * Shows a compact vertical list suitable for the left panel
 *
 * @param props - Component props
 */
export function SpellList({
  spells,
  selectedSpellId,
  isLoading,
  isError,
  onSpellClick,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  refetch,
}: SpellListProps) {
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
  if (isError && spells.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mb-3" />
        <p className="text-sm font-semibold mb-1">Failed to load spells</p>
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
  if (!isLoading && spells.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Search className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-sm font-semibold mb-1">No spells found</p>
        <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
      </div>
    );
  }

  // Main list with spells
  return (
    <div className="h-full">
      {spells.map((spell) => (
        <SpellListItem key={spell.id} spell={spell} isSelected={selectedSpellId === spell.id} onClick={onSpellClick} />
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
