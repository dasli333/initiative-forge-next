'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { CampaignDTO } from '@/types/campaigns';

interface StoryItemsHeaderProps {
  campaign: CampaignDTO;
  onAddClick: () => void;
}

/**
 * Header for Story Items view
 * Includes breadcrumb navigation and Add button
 */
export function StoryItemsHeader({ campaign, onAddClick }: StoryItemsHeaderProps) {
  return (
    <div className="space-y-4 pb-4 border-b">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/campaigns">My Campaigns</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/campaigns/${campaign.id}`}>{campaign.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Story Items</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Story Items</h1>
        <Button
          onClick={onAddClick}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Add Story Item
        </Button>
      </div>
    </div>
  );
}
