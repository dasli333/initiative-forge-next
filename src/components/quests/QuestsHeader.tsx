'use client';

import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Plus } from 'lucide-react';
import { useCampaignStore } from '@/stores/campaignStore';

interface QuestsHeaderProps {
  onCreateClick: () => void;
}

export function QuestsHeader({ onCreateClick }: QuestsHeaderProps) {
  const { selectedCampaign } = useCampaignStore();

  return (
    <div className="space-y-4 pb-4 border-b">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/campaigns">Campaigns</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/campaigns/${selectedCampaign?.id}`}>
              {selectedCampaign?.name || 'Campaign'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Quests</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quests</h1>
        <Button onClick={onCreateClick} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          New Quest
        </Button>
      </div>
    </div>
  );
}
