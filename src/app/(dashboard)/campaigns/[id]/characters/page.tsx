import { CharactersPageClient } from '@/components/campaigns/CharactersPageClient';

interface CharactersPageProps {
  params: Promise<{
    id: string;
  }>;
}



/**
 * Characters management page
 * Route: /campaigns/[id]/characters
 */
export default async function CharactersPage({ params }: CharactersPageProps) {
  const { id } = await params;
  return <CharactersPageClient campaignId={id} />;
}
