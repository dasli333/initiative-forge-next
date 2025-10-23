import { CampaignDetailClient } from '@/components/campaigns/CampaignDetailClient';
import { CampaignsContent } from '@/components/campaigns/CampaignsContent';

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
 * Handles both /campaigns (list) and /campaigns/[id] (detail) with client-side routing
 * This approach is necessary for output: 'export' with dynamic routes
 */
export default async function CampaignsRoute({ params }: CampaignsRouteProps) {
  const { slug } = await params;

  // No slug = campaigns list page
  if (!slug || slug.length === 0) {
    return <CampaignsContent />;
  }

  // First segment = campaign ID
  const [campaignId] = slug;

  // Handle sub-routes
  if (slug.length > 1) {
    // Future: /campaigns/[id]/characters, /campaigns/[id]/combats, etc.
    return <div>Sub-route: {slug.join('/')}</div>;
  }

  // Campaign detail page
  return <CampaignDetailClient campaignId={campaignId} />;
}
