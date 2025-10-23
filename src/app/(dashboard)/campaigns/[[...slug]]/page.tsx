import { CampaignDetailClient } from '@/components/campaigns/CampaignDetailClient';
import { CampaignsContent } from '@/components/campaigns/CampaignsContent';
import { CampaignSubRouteHandler } from '@/components/campaigns/CampaignSubRouteHandler';

interface CampaignsRouteProps {
  params: Promise<{
    slug?: string[];
  }>;
}

// Generate static params for the base route
export function generateStaticParams() {
  return [{ slug: [] }];
}

/**
 * Campaigns catch-all route
 * Handles:
 * - /campaigns → campaigns list
 * - /campaigns/[id] → campaign detail
 * - /campaigns/[id]/characters → characters management
 * - /campaigns/[id]/combats → combats management
 * This approach is necessary for output: 'export' with dynamic routes
 */
export default async function CampaignsRoute({ params }: CampaignsRouteProps) {
  const { slug } = await params;

  // No slug = campaigns list page
  if (!slug || slug.length === 0) {
    return <CampaignsContent />;
  }

  // First segment = campaign ID
  const campaignId = slug[0];

  // Handle sub-routes (pass remaining segments)
  if (slug.length > 1) {
    return <CampaignSubRouteHandler campaignId={campaignId} slugSegments={slug.slice(1)} />;
  }

  // Campaign detail page
  return <CampaignDetailClient campaignId={campaignId} />;
}
