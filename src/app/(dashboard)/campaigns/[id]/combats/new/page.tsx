import { NewCombatPageClient } from '@/components/campaigns/NewCombatPageClient';

interface NewCombatPageProps {
  params: Promise<{
    id: string;
  }>;
}



/**
 * Combat creation page
 * Route: /campaigns/[id]/combats/new
 */
export default async function NewCombatPage({ params }: NewCombatPageProps) {
  const { id } = await params;
  return <NewCombatPageClient campaignId={id} />;
}
