'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import type { CampaignDTO } from '@/types/campaigns';

interface StoryItemsHeaderProps {
  campaign: CampaignDTO;
  onAddClick: () => void;
}

export function StoryItemsHeader({ campaign, onAddClick }: StoryItemsHeaderProps) {
  return (
    <PageHeader
      breadcrumbs={[
        { label: 'My Campaigns', href: '/campaigns' },
        { label: campaign.name, href: `/campaigns/${campaign.id}` },
        { label: 'Story Items' },
      ]}
      title="Story Items"
      actions={
        <Button onClick={onAddClick} className="bg-emerald-600 hover:bg-emerald-700">
          <Sparkles className="mr-2 h-4 w-4" />
          Add Story Item
        </Button>
      }
    />
  );
}
