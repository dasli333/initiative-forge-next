'use client';

import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LanguageSelector } from '@/components/npcs/shared/LanguageSelector';
import type { PlayerCharacterDetailsViewModel } from '@/types/player-characters';
import type { JSONContent } from '@tiptap/core';

interface StoryTabProps {
  isEditing: boolean;
  editedData: {
    languages: string[] | null;
    biography_json: JSONContent | null;
    personality_json: JSONContent | null;
  } | null;
  viewModel: PlayerCharacterDetailsViewModel | null;
  onFieldChange: (field: string, value: unknown) => void;
  campaignId: string;
  factions: Array<{ id: string; name: string }>;
}

/**
 * Story tab component for Player Character details
 * - Languages
 * - Biography (RichTextEditor with @mentions)
 * - Personality (RichTextEditor with @mentions)
 */
export function StoryTab({
  isEditing,
  editedData,
  viewModel,
  onFieldChange,
  campaignId,
}: StoryTabProps) {
  if (!viewModel) return null;

  // Use editedData when editing, viewModel when viewing
  const displayData = isEditing && editedData ? editedData : {
    languages: viewModel.languages,
    biography_json: viewModel.biography_json,
    personality_json: viewModel.personality_json,
  };

  return (
    <div className="space-y-6">
      {/* Languages */}
      <div>
        <Label>Languages</Label>
        {!isEditing && displayData.languages && displayData.languages.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {displayData.languages.map((language) => (
              <Badge key={language} variant="secondary" className="text-xs">
                {language}
              </Badge>
            ))}
          </div>
        )}
        {!isEditing && (!displayData.languages || displayData.languages.length === 0) && (
          <p className="text-sm text-muted-foreground mt-1">No languages specified</p>
        )}
        {isEditing && (
          <div className="mt-2">
            <LanguageSelector
              value={displayData.languages || []}
              onChange={(languages) => onFieldChange('languages', languages.length > 0 ? languages : null)}
              maxLanguages={20}
            />
          </div>
        )}
      </div>

      {/* Biography RichTextEditor */}
      <div>
        <Label>Biography</Label>
        <div className="mt-2">
          <RichTextEditor
            value={displayData.biography_json}
            onChange={(content) => isEditing && onFieldChange('biography_json', content)}
            campaignId={campaignId}
            placeholder="Write the character's backstory and biography..."
            readonly={!isEditing}
          />
        </div>
      </div>

      {/* Personality RichTextEditor */}
      <div>
        <Label>Personality</Label>
        <div className="mt-2">
          <RichTextEditor
            value={displayData.personality_json}
            onChange={(content) => isEditing && onFieldChange('personality_json', content)}
            campaignId={campaignId}
            placeholder="Describe personality traits, quirks, speech patterns..."
            readonly={!isEditing}
          />
        </div>
      </div>
    </div>
  );
}
