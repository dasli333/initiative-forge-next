'use client';

import { useCampaignQuery } from '@/hooks/useCampaign';
import { CharactersView } from '@/components/characters/CharactersView';
import { CombatsListView } from '@/components/combats/CombatsListView';

interface CampaignSubRouteHandlerProps {
  campaignId: string;
  subRoute: string;
}

/**
 * Client component that handles campaign sub-routes
 * Fetches campaign data and renders appropriate view
 */
export function CampaignSubRouteHandler({ campaignId, subRoute }: CampaignSubRouteHandlerProps) {
  const { data: campaign, isLoading, error } = useCampaignQuery(campaignId);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-12 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-2">Campaign not found</h1>
          <p className="text-muted-foreground">Unable to load campaign data.</p>
        </div>
      </div>
    );
  }

  // Route to appropriate view
  switch (subRoute) {
    case 'characters':
      return <CharactersView campaignId={campaignId} campaignName={campaign.name} />;

    case 'combats':
      return <CombatsListView campaignId={campaignId} campaignName={campaign.name} />;

    default:
      return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-2">Page not found</h1>
            <p className="text-muted-foreground">The page {subRoute} does not exist.</p>
          </div>
        </div>
      );
  }
}
