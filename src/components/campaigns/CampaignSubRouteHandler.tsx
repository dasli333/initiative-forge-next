'use client';

import { useCampaignQuery } from '@/hooks/useCampaign';
import { CharactersView } from '@/components/characters/CharactersView';
import { CombatsListView } from '@/components/combats/CombatsListView';
import { SimplifiedCombatCreation } from '@/components/combat-wizard/SimplifiedCombatCreation';

interface CampaignSubRouteHandlerProps {
  campaignId: string;
  slugSegments: string[];
}

/**
 * Client component that handles campaign sub-routes
 * Fetches campaign data and renders appropriate view
 */
export function CampaignSubRouteHandler({ campaignId, slugSegments }: CampaignSubRouteHandlerProps) {
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

  // Extract first segment as main route
  const [mainRoute, ...restSegments] = slugSegments;

  // Route to appropriate view
  switch (mainRoute) {
    case 'characters':
      return <CharactersView campaignId={campaignId} campaignName={campaign.name} />;

    case 'combats':
      // Handle nested combats routes
      if (restSegments.length > 0 && restSegments[0] === 'new') {
        return <SimplifiedCombatCreation campaignId={campaignId} campaignName={campaign.name} />;
      }
      return <CombatsListView campaignId={campaignId} campaignName={campaign.name} />;

    default:
      return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-2">Page not found</h1>
            <p className="text-muted-foreground">The page {slugSegments.join('/')} does not exist.</p>
          </div>
        </div>
      );
  }
}
