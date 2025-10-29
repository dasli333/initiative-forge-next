'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} from '@/hooks/useCampaigns';
import { useCampaignStore } from '@/stores/campaignStore';
import type { CampaignViewModel } from '@/types/campaigns';
import { Button } from '@/components/ui/button';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { CampaignsHeader } from './CampaignsHeader';
import { CampaignsGrid } from './CampaignsGrid';
import { CreateCampaignModal } from './CreateCampaignModal';
import { DeleteCampaignModal } from './DeleteCampaignModal';

/**
 * Main content component for the campaigns view using React Query
 * Manages the state and orchestrates all campaign operations
 */
export function CampaignsContent() {
  const router = useRouter();
  const { data: campaigns = [], isLoading, error, refetch } = useCampaignsQuery();
  const createCampaignMutation = useCreateCampaignMutation();
  const updateCampaignMutation = useUpdateCampaignMutation();
  const deleteCampaignMutation = useDeleteCampaignMutation();
  const { setSelectedCampaign } = useCampaignStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModalCampaign, setDeleteModalCampaign] = useState<CampaignViewModel | null>(null);

  const handleCampaignSelect = (id: string) => {
    // Find the campaign and set it in the store before navigation
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) {
      setSelectedCampaign(campaign); // CampaignViewModel extends Campaign
    }
    // Navigate to campaign details page
    router.push(`/campaigns/${id}`);
  };

  const handleCampaignUpdate = async (id: string, name: string) => {
    await updateCampaignMutation.mutateAsync({ id, name });
  };

  const handleCampaignDelete = (campaign: CampaignViewModel) => {
    setDeleteModalCampaign(campaign);
  };

  const handleCreate = async (name: string) => {
    const result = await createCampaignMutation.mutateAsync(name);
    if (result) {
      return { success: true };
    }
    return { success: false, error: 'Failed to create campaign' };
  };

  const handleDelete = async (id: string) => {
    await deleteCampaignMutation.mutateAsync(id);
    return { success: true };
  };

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error loading campaigns</h2>
          <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : 'An error occurred'}</p>
          <Button onClick={() => refetch()} variant="default">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (campaigns.length === 0) {
    return (
      <>
        <EmptyState onCreate={() => setIsCreateModalOpen(true)} />
        <CreateCampaignModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => setIsCreateModalOpen(false)}
          onCreate={handleCreate}
        />
      </>
    );
  }

  // Show campaigns grid
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <CampaignsHeader totalCampaigns={campaigns.length} />

      <CampaignsGrid
        campaigns={campaigns}
        onCampaignSelect={handleCampaignSelect}
        onCampaignUpdate={handleCampaignUpdate}
        onCampaignDelete={handleCampaignDelete}
        onCreate={() => setIsCreateModalOpen(true)}
      />

      {/* Modals */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />

      <DeleteCampaignModal
        campaign={deleteModalCampaign}
        onClose={() => setDeleteModalCampaign(null)}
        onSuccess={() => setDeleteModalCampaign(null)}
        onDelete={handleDelete}
      />
    </div>
  );
}
