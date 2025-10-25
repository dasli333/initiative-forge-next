'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCombatsQuery, useDeleteCombatMutation } from '@/hooks/useCombats';
import { CombatsHeader } from './CombatsHeader';
import { CombatsGrid } from './CombatsGrid';
import { EmptyState } from './EmptyState';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { CombatSummaryDTO } from '@/types';

export interface CombatsListViewProps {
  campaignId: string;
  campaignName: string;
}

/**
 * Loading skeleton for combats list
 */
const SkeletonLoader = ({ count }: { count: number }) => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-[200px] w-full" />
    ))}
  </div>
);

/**
 * Error state component
 */
const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
    <h2 className="text-2xl font-semibold text-destructive">Failed to load combats</h2>
    <p className="text-muted-foreground">There was an error loading the combats list.</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

/**
 * Main combats list view component
 */
export function CombatsListView({ campaignId, campaignName }: CombatsListViewProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [combatToDelete, setCombatToDelete] = useState<CombatSummaryDTO | null>(null);

  const { data, isLoading, isError, refetch } = useCombatsQuery(campaignId);
  const deleteMutation = useDeleteCombatMutation(campaignId);

  const handleCreateNew = useCallback(() => {
    router.push(`/campaigns/${campaignId}/combats/new`);
  }, [campaignId, router]);

  const handleResume = useCallback(
    (combat: CombatSummaryDTO) => {
      router.push(`/combats/${combat.id}?campaignId=${combat.campaign_id}`);
    },
    [router]
  );

  const handleView = useCallback(
    (combat: CombatSummaryDTO) => {
      router.push(`/combats/${combat.id}?campaignId=${combat.campaign_id}`);
    },
    [router]
  );

  const handleDeleteClick = useCallback((combat: CombatSummaryDTO) => {
    setCombatToDelete(combat);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (combatToDelete) {
      deleteMutation.mutate(combatToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setCombatToDelete(null);
        },
      });
    }
  }, [combatToDelete, deleteMutation]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false);
    setCombatToDelete(null);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <CombatsHeader campaignId={campaignId} campaignName={campaignName} onCreateNew={handleCreateNew} />
        <div className="mt-6">
          <SkeletonLoader count={6} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6">
        <CombatsHeader campaignId={campaignId} campaignName={campaignName} onCreateNew={handleCreateNew} />
        <div className="mt-6">
          <ErrorState onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (data && data.combats.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <CombatsHeader campaignId={campaignId} campaignName={campaignName} onCreateNew={handleCreateNew} />
        <div className="mt-6">
          <EmptyState onCreateNew={handleCreateNew} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <CombatsHeader campaignId={campaignId} campaignName={campaignName} onCreateNew={handleCreateNew} />
      <div className="mt-6">
        {data && (
          <CombatsGrid
            combats={data.combats}
            onResume={handleResume}
            onView={handleView}
            onDelete={handleDeleteClick}
          />
        )}
      </div>
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        combatName={combatToDelete?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
