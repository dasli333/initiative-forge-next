'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';

interface TimelineHeaderProps {
  campaignId: string;
  campaignName?: string;
  onAddEventClick: () => void;
}

export function TimelineHeader({
  campaignId,
  campaignName,
  onAddEventClick,
}: TimelineHeaderProps) {
  return (
    <PageHeader
      breadcrumbs={[
        { label: 'My Campaigns', href: '/campaigns' },
        { label: campaignName || 'Campaign', href: `/campaigns/${campaignId}` },
        { label: 'Timeline' },
      ]}
      title="Timeline"
      className="border-b-0 mb-2"
      actions={
        <Button onClick={onAddEventClick} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      }
    />
  );
}
