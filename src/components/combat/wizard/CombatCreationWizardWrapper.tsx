import { QueryClientProvider, HydrationBoundary } from "@tanstack/react-query";
import type { DehydratedState } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { CombatCreationWizard } from "./CombatCreationWizard";

interface CombatCreationWizardWrapperProps {
  campaignId: string;
  dehydratedState: DehydratedState;
}

/**
 * Wrapper component that provides QueryClient and hydrates server-side data
 * This ensures proper SSR support and prevents hydration errors
 */
export function CombatCreationWizardWrapper({ campaignId, dehydratedState }: CombatCreationWizardWrapperProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <CombatCreationWizard campaignId={campaignId} />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
