'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

interface CharacterListHeaderProps {
  campaignName: string;
  campaignId: string;
  onAddCharacter: () => void;
}

/**
 * Header component for the character list view
 * Contains breadcrumb navigation and add character button
 */
export const CharacterListHeader = ({ campaignName, campaignId, onAddCharacter }: CharacterListHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
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
                <Link href={`/campaigns/${campaignId}`}>{campaignName}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Characters</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl font-bold">Player Characters</h1>
      </div>

      <Button
        data-testid="create-character-button"
        onClick={onAddCharacter}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Player Character
      </Button>
    </div>
  );
};
