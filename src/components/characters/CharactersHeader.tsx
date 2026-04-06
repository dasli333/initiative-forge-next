'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';

interface CharactersHeaderProps {
  campaignName: string;
  campaignId: string;
  onAddClick: () => void;
}

export function CharactersHeader({
  campaignName,
  campaignId,
  onAddClick,
}: CharactersHeaderProps) {
  return (
    <PageHeader
      breadcrumbs={[
        { label: 'My Campaigns', href: '/campaigns' },
        { label: campaignName, href: `/campaigns/${campaignId}` },
        { label: 'Characters' },
      ]}
      title="Player Characters"
      actions={
        <Button onClick={onAddClick} className="bg-emerald-600 hover:bg-emerald-700" data-testid="create-character-button">
          <Plus className="h-4 w-4 mr-2" />
          Add Character
        </Button>
      }
    />
  );
}
