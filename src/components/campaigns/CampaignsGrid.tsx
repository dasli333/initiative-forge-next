'use client';

import type { CampaignViewModel } from '@/types/campaigns';
import { CampaignCard } from './CampaignCard';
import { PlusTile } from './PlusTile';

interface CampaignsGridProps {
  /** List of campaigns to display */
  campaigns: CampaignViewModel[];
  /** Callback when user selects a campaign */
  onCampaignSelect: (id: string) => void;
  /** Callback when user updates a campaign name */
  onCampaignUpdate: (id: string, name: string) => Promise<void>;
  /** Callback when user requests to delete a campaign */
  onCampaignDelete: (campaign: CampaignViewModel) => void;
  /** Callback to open create campaign modal */
  onCreate: () => void;
}

/**
 * Responsive grid container for campaign cards
 * Displays campaigns in a responsive grid layout with a plus tile at the end
 */
export function CampaignsGrid({
  campaigns,
  onCampaignSelect,
  onCampaignUpdate,
  onCampaignDelete,
  onCreate,
}: CampaignsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onUpdate={onCampaignUpdate}
          onDelete={onCampaignDelete}
          onSelect={onCampaignSelect}
        />
      ))}
      <PlusTile onCreate={onCreate} />
    </div>
  );
}
