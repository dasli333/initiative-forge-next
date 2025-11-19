'use client';

import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { ImageUpload } from '@/components/shared/ImageUpload';
import type { FactionDTO } from '@/types/factions';
import type { JSONContent } from '@tiptap/core';

interface DetailsTabProps {
  faction: FactionDTO;
  campaignId: string;
  isEditing: boolean;
  editedData: {
    description_json: JSONContent | null;
    goals_json: JSONContent | null;
    image_url: string | null;
  } | null;
  onEditedDataChange: (field: string, value: unknown) => void;
  isUpdating?: boolean;
}

/**
 * Details tab for faction
 * Shows image, description, and goals with rich text editing
 */
export function DetailsTab({
  faction,
  campaignId,
  isEditing,
  editedData,
  onEditedDataChange,
  isUpdating = false,
}: DetailsTabProps) {
  const displayData = isEditing && editedData ? editedData : {
    description_json: faction.description_json,
    goals_json: faction.goals_json,
    image_url: faction.image_url,
  };

  return (
    <div className="space-y-6">
      {/* Image Section */}
      <div>
        <label className="text-sm font-medium mb-2 block">Faction Image</label>
        {isEditing ? (
          <ImageUpload
            value={displayData.image_url}
            onChange={(url) => onEditedDataChange('image_url', url)}
            campaignId={campaignId}
            entityType="faction"
            maxSizeMB={5}
          />
        ) : displayData.image_url ? (
          <img
            src={displayData.image_url}
            alt={faction.name}
            className="w-full max-w-2xl rounded-lg object-cover"
            style={{ aspectRatio: '16/9' }}
          />
        ) : (
          <div className="w-full max-w-2xl rounded-lg bg-muted flex items-center justify-center text-muted-foreground" style={{ aspectRatio: '16/9' }}>
            No image
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Description</h3>
        <RichTextEditor
          value={displayData.description_json}
          onChange={(content) => isEditing && onEditedDataChange('description_json', content)}
          campaignId={campaignId}
          placeholder="Describe this faction: history, structure, influence..."
          readonly={!isEditing}
        />
      </div>

      {/* Goals */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Goals & Motivations</h3>
        <RichTextEditor
          value={displayData.goals_json}
          onChange={(content) => isEditing && onEditedDataChange('goals_json', content)}
          campaignId={campaignId}
          placeholder="What does this faction want? Short-term and long-term goals..."
          readonly={!isEditing}
        />
      </div>
    </div>
  );
}
