'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';

export interface CombatsHeaderProps {
  campaignId: string;
  campaignName: string;
  onCreateNew: () => void;
}

export function CombatsHeader({ campaignId, campaignName, onCreateNew }: CombatsHeaderProps) {
  return (
    <PageHeader
      breadcrumbs={[
        { label: 'My Campaigns', href: '/campaigns' },
        { label: campaignName, href: `/campaigns/${campaignId}` },
        { label: 'Combats' },
      ]}
      title="Combats"
      actions={
        <Button onClick={onCreateNew} className="bg-emerald-600 hover:bg-emerald-700" data-testid="create-combat-button">
          <Plus className="mr-2 h-4 w-4" />
          Start New Combat
        </Button>
      }
    />
  );
}
