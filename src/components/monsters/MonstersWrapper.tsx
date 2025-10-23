import { QueryClientProvider, HydrationBoundary } from "@tanstack/react-query";
import type { DehydratedState } from "@tanstack/react-query";
import { useState } from "react";
import { getQueryClient } from "@/lib/queryClient";
import { MonstersLibraryView } from "./MonstersLibraryView";

/**
 * Props for MonstersWrapper component
 */
interface MonstersWrapperProps {
  /**
   * Dehydrated React Query state from server-side prefetching
   * Ensures server and client render the same initial state (prevents hydration errors)
   */
  dehydratedState: DehydratedState;
}

/**
 * Wrapper component that provides React Query context to MonstersLibraryView
 *
 * Pattern: Each Astro island gets its own QueryClientProvider
 * but all share the same singleton QueryClient instance via getQueryClient()
 *
 * This ensures:
 * - React Query hooks work properly (QueryClient is available in context)
 * - Cache persists across client-side navigation
 * - SSR safety (new instance per request on server)
 * - No hydration errors (dehydrated state ensures server/client match)
 */
export function MonstersWrapper({ dehydratedState }: MonstersWrapperProps) {
  // Get singleton QueryClient instance (shared across all islands)
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <MonstersLibraryView />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
