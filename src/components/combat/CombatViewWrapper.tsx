// React Query wrapper for Combat View
'use client';

import { QueryClientProvider, HydrationBoundary } from "@tanstack/react-query";
import type { DehydratedState } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { CombatTracker } from "./CombatTracker";
import type { CombatDTO } from "@/types";

interface CombatViewWrapperProps {
  dehydratedState: DehydratedState;
  combatId: string;
  campaignId: string;
  initialData: CombatDTO;
}

export function CombatViewWrapper({ dehydratedState, combatId, campaignId, initialData }: CombatViewWrapperProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <CombatTracker combatId={combatId} campaignId={campaignId} initialData={initialData} />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
