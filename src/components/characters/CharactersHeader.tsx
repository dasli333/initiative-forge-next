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
import { Plus } from 'lucide-react';

interface CharactersHeaderProps {
  campaignName: string;
  campaignId: string;
  onAddClick: () => void;
}

/**
 * Header component for Player Characters page
 * - Breadcrumb: My Campaigns → [Campaign Name] → Characters
 * - H1: "Player Characters"
 * - Actions: "Add Character" button
 */
export function CharactersHeader({
  campaignName,
  campaignId,
  onAddClick,
}: CharactersHeaderProps) {
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
            <BreadcrumbPage>Characters</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Player Characters</h1>
        <Button onClick={onAddClick} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Character
        </Button>
      </div>
    </div>
  );
}
