'use client';

import { CombatsListView } from '@/components/combats/CombatsListView';
import { useCampaignQuery } from '@/hooks/useCampaign';

interface CombatsPageClientProps {
  campaignId: string;
}

export function CombatsPageClient({ campaignId }: CombatsPageClientProps) {
  const { data: campaign, isLoading } = useCampaignQuery(campaignId);

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

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-2">Campaign not found</h1>
          <p className="text-muted-foreground">Unable to load campaign data.</p>
        </div>
      </div>
    );
  }

  return <CombatsListView campaignId={campaignId} campaignName={campaign.name} />;
}
