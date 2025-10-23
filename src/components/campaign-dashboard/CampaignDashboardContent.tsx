'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { CampaignHeader } from './CampaignHeader';
import { StatsOverview } from './StatsOverview';
import { QuickActionsSection } from './QuickActionsSection';
import { useCampaignQuery, useCampaignCharactersQuery } from '@/hooks/useCampaign';
import { useUpdateCampaignMutation } from '@/hooks/useCampaigns';
import { useCampaignStore } from '@/stores/campaignStore';
import type { Campaign } from '@/types';

interface CampaignDashboardContentProps {
  campaignId: string;
}

/**
 * Campaign Dashboard Content with React Query
 * Main React component for campaign dashboard with breadcrumb, header, stats, and quick actions
 */
export function CampaignDashboardContent({ campaignId }: CampaignDashboardContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSelectedCampaign } = useCampaignStore();

  // Use React Query for data fetching
  const { data: campaign } = useCampaignQuery(campaignId, {
    enabled: true,
  });

  const { data: characters = [] } = useCampaignCharactersQuery(campaignId, {
    enabled: true,
  });

  const updateCampaignMutation = useUpdateCampaignMutation();

  // Update the selected campaign in the global store (for Sidebar display)
  useEffect(() => {
    if (campaign) {
      setSelectedCampaign(campaign);
    }
  }, [campaign, setSelectedCampaign]);

  // Focus on container for accessibility
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  const updateCampaignName = async (name: string) => {
    if (campaign) {
      await updateCampaignMutation.mutateAsync({ id: campaign.id, name });
    }
  };

  // Show loading state while initial data loads
  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-12 bg-muted rounded w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  const charactersCount = characters.length;
  const isUpdating = updateCampaignMutation.isPending;
  const error = updateCampaignMutation.error
    ? updateCampaignMutation.error instanceof Error
      ? updateCampaignMutation.error.message
      : 'Failed to update campaign'
    : null;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="container mx-auto px-4 py-8 max-w-7xl space-y-8 focus:outline-none"
    >
      {/* Breadcrumb navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/campaigns">My Campaigns</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{campaign.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Campaign header */}
      <CampaignHeader campaign={campaign} isUpdating={isUpdating} onUpdateName={updateCampaignName} />

      {/* Stats overview */}
      <StatsOverview charactersCount={charactersCount} />

      {/* Quick actions */}
      <QuickActionsSection campaignId={campaign.id} />
    </div>
  );
}
