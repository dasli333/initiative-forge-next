'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import type { CampaignViewModel } from '@/types/campaigns';
import { EditableTitle } from './EditableTitle';

interface CampaignCardProps {
  /** Campaign data to display */
  campaign: CampaignViewModel;
  /** Callback to update campaign name */
  onUpdate: (id: string, name: string) => Promise<void>;
  /** Callback to delete campaign */
  onDelete: (campaign: CampaignViewModel) => void;
  /** Callback to select/navigate to campaign */
  onSelect: (id: string) => void;
}

/**
 * Campaign card component displaying campaign information
 * Supports inline editing, deletion, and navigation
 */
export function CampaignCard({ campaign, onUpdate, onDelete, onSelect }: CampaignCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async (newName: string) => {
    setIsUpdating(true);
    try {
      await onUpdate(campaign.id, newName);
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card data-testid={`campaign-card-${campaign.name}`} className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <EditableTitle
              value={campaign.name}
              isEditing={isEditing}
              isUpdating={isUpdating}
              onEdit={() => setIsEditing(true)}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>

          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button data-testid="campaign-options-button" variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Campaign options">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem data-testid="edit-campaign-name" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Name
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-testid="delete-campaign-button"
                  onClick={() => onDelete(campaign)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-2">
        <div className="text-xs text-muted-foreground">
          Last modified: {formatDate(campaign.updated_at)}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button data-testid="select-campaign-button" onClick={() => onSelect(campaign.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 h-9">
          Select Campaign
        </Button>
      </CardFooter>
    </Card>
  );
}
