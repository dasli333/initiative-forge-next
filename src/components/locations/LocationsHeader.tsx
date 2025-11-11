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
            <BreadcrumbPage>Locations</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Locations</h1>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={onAddLocationClick}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>
    </div>
  );
}
