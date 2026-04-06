'use client';

import { Button } from '@/components/ui/button';
import { Plus, Tags } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';

interface NPCsHeaderProps {
  campaignName: string;
  campaignId: string;
  onAddClick: () => void;
  onManageTagsClick: () => void;
}

export function NPCsHeader({
  campaignName,
  campaignId,
  onAddClick,
  onManageTagsClick,
}: NPCsHeaderProps) {
  return (
    <PageHeader
      breadcrumbs={[
        { label: 'My Campaigns', href: '/campaigns' },
        { label: campaignName, href: `/campaigns/${campaignId}` },
        { label: 'NPCs' },
      ]}
      title="NPCs"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={onManageTagsClick}>
            <Tags className="h-4 w-4 mr-2" />
            Manage Tags
          </Button>
          <Button onClick={onAddClick} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Add NPC
          </Button>
        </div>
      }
    />
  );
}
