import { CampaignDetailClient } from '@/components/campaigns/CampaignDetailClient';

interface CampaignDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}



/**
 * Campaign detail page
 * Route: /campaigns/[id]
 */
export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params;
  return <CampaignDetailClient campaignId={id} />;
}
