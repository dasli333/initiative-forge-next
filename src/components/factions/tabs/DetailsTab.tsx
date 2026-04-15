'use client';

import Image from 'next/image';
import { Shield } from 'lucide-react';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { ImageLightbox } from '@/components/shared/ImageLightbox';
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
          <div className="w-40">
            <ImageUpload
              value={displayData.image_url}
              onChange={(url) => onEditedDataChange('image_url', url)}
              campaignId={campaignId}
              entityType="faction"
              maxSizeMB={5}
              className="[&_img]:h-40 [&_img]:w-40"
              deferStorageDelete
            />
          </div>
        ) : displayData.image_url ? (
          <ImageLightbox src={displayData.image_url} alt={faction.name}>
            <Image
              src={displayData.image_url}
              alt={faction.name}
              width={160}
              height={160}
              className="w-40 h-40 rounded-lg object-cover border-2 border-border"
            />
          </ImageLightbox>
        ) : (
          <div className="w-40 h-40 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center">
            <Shield className="w-16 h-16 text-muted-foreground/50" />
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
