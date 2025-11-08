'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Plus, Tags } from 'lucide-react';

interface NPCsHeaderProps {
  campaignName: string;
  campaignId: string;
  onAddClick: () => void;
  onManageTagsClick: () => void;
}

/**
 * Header component for NPCs page
 * - Breadcrumb: My Campaigns → [Campaign Name] → NPCs
 * - H1: "NPCs"
 * - Actions: "Manage Tags" and "Add NPC" buttons
 */
export function NPCsHeader({
  campaignName,
  campaignId,
  onAddClick,
  onManageTagsClick,
}: NPCsHeaderProps) {
  return (
    <div className="space-y-4 pb-4 border-b">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/campaigns">My Campaigns</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/campaigns/${campaignId}`}>
              {campaignName}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>NPCs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">NPCs</h1>
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
      </div>
    </div>
  );
}
