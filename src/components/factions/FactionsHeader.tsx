'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';

interface FactionsHeaderProps {
  campaignName: string;
  campaignId: string;
  onAddClick: () => void;
}

export function FactionsHeader({
  campaignName,
  campaignId,
  onAddClick,
}: FactionsHeaderProps) {
  return (
    <PageHeader
      breadcrumbs={[
        { label: 'My Campaigns', href: '/campaigns' },
        { label: campaignName, href: `/campaigns/${campaignId}` },
        { label: 'Factions' },
      ]}
      title="Factions"
      actions={
        <Button onClick={onAddClick} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Faction
        </Button>
      }
    />
  );
}
