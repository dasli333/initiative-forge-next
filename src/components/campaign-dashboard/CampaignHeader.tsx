'use client';

import { EditableHeading } from './EditableHeading';
import { CampaignMetadata } from './CampaignMetadata';
import type { Campaign } from '@/types';

interface CampaignHeaderProps {
  campaign: Campaign;
  isUpdating: boolean;
  onUpdateName: (name: string) => Promise<void>;
}

/**
 * Campaign header component
 * Displays editable campaign name and metadata
 */
export function CampaignHeader({ campaign, isUpdating, onUpdateName }: CampaignHeaderProps) {
  return (
    <header className="space-y-2">
      <EditableHeading value={campaign.name} isUpdating={isUpdating} onSave={onUpdateName} />
      <CampaignMetadata createdAt={campaign.created_at} />
    </header>
  );
}
