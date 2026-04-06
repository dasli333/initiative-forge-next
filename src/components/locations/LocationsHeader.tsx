'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';

interface LocationsHeaderProps {
  campaignName: string;
  campaignId: string;
  onAddLocationClick: () => void;
}

export function LocationsHeader({
  campaignName,
  campaignId,
  onAddLocationClick,
}: LocationsHeaderProps) {
  return (
    <PageHeader
      breadcrumbs={[
        { label: 'My Campaigns', href: '/campaigns' },
        { label: campaignName, href: `/campaigns/${campaignId}` },
        { label: 'Locations' },
      ]}
      title="Locations"
      actions={
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={onAddLocationClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      }
    />
  );
}
