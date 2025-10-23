'use client';

interface CampaignsHeaderProps {
  /** Total number of campaigns */
  totalCampaigns: number;
}

/**
 * Header component for campaigns view
 * Displays title and campaign count
 */
export function CampaignsHeader({ totalCampaigns }: CampaignsHeaderProps) {
  const campaignText = totalCampaigns === 1 ? 'campaign' : 'campaigns';

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold mb-2">My Campaigns</h1>
      <p className="text-muted-foreground text-lg">
        {totalCampaigns} {campaignText}
      </p>
    </div>
  );
}
