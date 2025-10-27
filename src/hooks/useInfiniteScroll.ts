import { useRef, useEffect } from "react";

/**
 * Options for useInfiniteScroll hook
 */
interface UseInfiniteScrollOptions {
  /**
   * Callback function to load more items
   */
  onLoadMore: () => void;
  /**
   * Whether there are more items to load
   */
  hasMore: boolean;
  /**
   * Whether items are currently loading
   */
  isLoading: boolean;
  /**
   * Intersection observer threshold (0-1)
   * @default 0.1
   */
  threshold?: number;
  /**
   * Root margin for intersection observer
   * @default "0px"
   */
  rootMargin?: string;
}

/**
 * Return value from useInfiniteScroll hook
 */
interface UseInfiniteScrollReturn {
  /**
   * Ref to attach to the sentinel element that triggers loading
   */
  ref: React.RefObject<HTMLDivElement | null>;
}

/**
 * Reusable hook for implementing infinite scroll with Intersection Observer
 *
 * @example
 * ```tsx
 * const { ref: loadMoreRef } = useInfiniteScroll({
 *   onLoadMore: fetchNextPage,
 *   hasMore: hasNextPage,
 *   isLoading: isFetchingNextPage,
 *   threshold: 0.5
 * });
 *
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     {hasMore && <div ref={loadMoreRef}>Loading...</div>}
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.1,
  rootMargin = "0px",
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // When sentinel element is visible and conditions are met, load more
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold, rootMargin }
    );

    // Observe the sentinel element
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, onLoadMore, threshold, rootMargin]);

  return { ref: loadMoreRef };
}
