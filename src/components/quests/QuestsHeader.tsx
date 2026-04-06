'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useCampaignStore } from '@/stores/campaignStore';

interface QuestsHeaderProps {
  onCreateClick: () => void;
}

export function QuestsHeader({ onCreateClick }: QuestsHeaderProps) {
  const { selectedCampaign } = useCampaignStore();

  return (
    <PageHeader
      breadcrumbs={[
        { label: 'My Campaigns', href: '/campaigns' },
        { label: selectedCampaign?.name || 'Campaign', href: `/campaigns/${selectedCampaign?.id}` },
        { label: 'Quests' },
      ]}
      title="Quests"
      actions={
        <Button onClick={onCreateClick} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          New Quest
        </Button>
      }
    />
  );
}
