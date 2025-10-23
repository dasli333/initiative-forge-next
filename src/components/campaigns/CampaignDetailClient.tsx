'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CampaignDashboardContent } from '@/components/campaign-dashboard/CampaignDashboardContent';
import { useCampaignQuery } from '@/hooks/useCampaign';

interface CampaignDetailClientProps {
  campaignId: string;
}

/**
 * Client component for campaign detail page
 * Handles data fetching and UI states
 */
export function CampaignDetailClient({ campaignId }: CampaignDetailClientProps) {
  // Query to check if campaign exists
  const { data: campaign, isLoading, error } = useCampaignQuery(campaignId);

  // Show loading state
  if (isLoading) {
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

  // Show not found state
  if (error && error.message.includes('not found')) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-2">Campaign not found</h1>
          <p className="text-muted-foreground mb-6">
            This campaign doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Button asChild>
            <Link href="/campaigns">Back to My Campaigns</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground mb-6">
            {error.message || 'Failed to load campaign'}
          </p>
          <Button asChild>
            <Link href="/campaigns">Back to My Campaigns</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Show campaign dashboard
  if (campaign) {
    return <CampaignDashboardContent campaignId={campaignId} />;
  }

  return null;
}
