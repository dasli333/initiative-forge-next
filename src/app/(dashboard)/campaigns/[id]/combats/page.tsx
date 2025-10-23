import { CombatsPageClient } from '@/components/campaigns/CombatsPageClient';

interface CombatsPageProps {
  params: Promise<{
    id: string;
  }>;
}



/**
 * Combats list page
 * Route: /campaigns/[id]/combats
 */
export default async function CombatsPage({ params }: CombatsPageProps) {
  const { id } = await params;
  return <CombatsPageClient campaignId={id} />;
}
