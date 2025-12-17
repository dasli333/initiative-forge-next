'use client';

import { useEffect, useRef } from 'react';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EquipmentListItem } from './EquipmentListItem';
import { Skeleton } from '@/components/ui/skeleton';
import type { EquipmentDTO } from '@/types';

interface EquipmentListProps {
  /** Array of equipment to display */
  equipment: EquipmentDTO[];
  /** ID of the currently selected equipment */
  selectedEquipmentId: string | null;
  /** Whether initial data is loading */
  isLoading: boolean;
  /** Whether an error occurred */
  isError: boolean;
  /** Callback fired when an equipment item is clicked */
  onEquipmentClick: (equipmentId: string) => void;
  /** Whether there are more pages to load */
  hasNextPage: boolean;
  /** Whether the next page is currently being fetched */
  isFetchingNextPage: boolean;
  /** Callback to load the next page (infinite scroll) */
  onLoadMore: () => void;
  /** Optional refetch function for error recovery */
  refetch?: () => void;
}

/**
 * List container for displaying equipment with infinite scroll
 * Shows a compact vertical list suitable for the left panel
 */
export function EquipmentList({
  equipment,
  selectedEquipmentId,
  isLoading,
  isError,
  onEquipmentClick,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  refetch,
}: EquipmentListProps) {
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
  if (isError && equipment.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mb-3" />
        <p className="text-sm font-semibold mb-1">Failed to load equipment</p>
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
  if (!isLoading && equipment.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Search className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-sm font-semibold mb-1">No equipment found</p>
        <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
      </div>
    );
  }

  // Main list with equipment
  return (
    <div className="h-full">
      {equipment.map((item) => (
        <EquipmentListItem
          key={item.id}
          equipment={item}
          isSelected={selectedEquipmentId === item.id}
          onClick={onEquipmentClick}
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
