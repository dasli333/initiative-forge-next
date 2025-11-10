'use client';

import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { LanguageSelector } from '../shared/LanguageSelector';
import type { NPCDTO } from '@/types/npcs';
import type { JSONContent } from '@tiptap/core';

interface StoryTabProps {
  npc: NPCDTO;
  campaignId: string;
  isEditing: boolean;
  editedData: {
    biography_json: JSONContent | null;
    personality_json: JSONContent | null;
    languages: string[] | null;
    distinguishing_features: string | null;
    secrets: JSONContent | null;
  } | null;
  onEditedDataChange: (field: string, value: unknown) => void;
  isUpdating?: boolean;
}

/**
 * Story tab component for NPC details
 * - Descriptive fields: languages, distinguishing features, secrets
 * - RichTextEditor: biography_json, personality_json
 * - BacklinksSection: list of mentions
 * Note: Character card (name, avatar, stats) moved to parent component
 */
export function StoryTab({
  npc,
  campaignId,
  isEditing,
  editedData,
  onEditedDataChange,
  isUpdating = false,
}: StoryTabProps) {

  // Use editedData when editing, npc data when viewing
  const displayData = isEditing && editedData ? editedData : {
    biography_json: npc.biography_json,
    personality_json: npc.personality_json,
    languages: npc.languages || null,
    distinguishing_features: npc.distinguishing_features || null,
    secrets: npc.secrets || null,
  };

  return (
    <div className="space-y-6">

      {/* Languages Row */}
      {!isEditing && displayData.languages && displayData.languages.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Languages</label>
          <div className="flex flex-wrap gap-1.5">
            {displayData.languages.map((language) => (
              <Badge key={language} variant="secondary" className="text-xs">
                {language}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Distinguishing Features (View Mode) */}
      {!isEditing && displayData.distinguishing_features && (
        <div>
          <label className="text-sm font-medium mb-2 block">Distinguishing Features</label>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap">
            {displayData.distinguishing_features}
          </p>
        </div>
      )}

      {/* Edit Mode Fields */}
      {isEditing && (
        <>
          {/* Languages */}
          <div>
            <label className="text-sm font-medium mb-2 block">Languages</label>
            <LanguageSelector
              value={displayData.languages || []}
              onChange={(languages) => onEditedDataChange('languages', languages.length > 0 ? languages : null)}
              disabled={isUpdating}
              maxLanguages={20}
            />
          </div>

          {/* Distinguishing Features */}
          <div>
            <label className="text-sm font-medium mb-2 block">Distinguishing Features</label>
            <Textarea
              value={displayData.distinguishing_features || ''}
              onChange={(e) => onEditedDataChange('distinguishing_features', e.target.value || null)}
              placeholder="Physical characteristics, mannerisms, scars, voice, etc..."
              disabled={isUpdating}
              rows={3}
            />
          </div>

        </>
      )}

      {/* Secrets RichTextEditor */}
      <div>
        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Secrets (GM Only)
        </label>
        <RichTextEditor
          value={displayData.secrets}
          onChange={(content) => isEditing && onEditedDataChange('secrets', content)}
          campaignId={campaignId}
          placeholder="Secret motivations, hidden allegiances, plot hooks..."
          readonly={!isEditing}
          className="border-amber-300 dark:border-amber-700"
        />
        <p className="text-xs text-muted-foreground mt-1">
          This information is for the GM only and should not be shared with players
        </p>
      </div>

      {/* Biography RichTextEditor */}
      <div>
        <label className="text-sm font-medium mb-2 block">Biography</label>
        <RichTextEditor
          value={displayData.biography_json}
          onChange={(content) => isEditing && onEditedDataChange('biography_json', content)}
          campaignId={campaignId}
          placeholder="Write the NPC's backstory and biography..."
          readonly={!isEditing}
        />
      </div>

      {/* Personality RichTextEditor */}
      <div>
        <label className="text-sm font-medium mb-2 block">Personality</label>
        <RichTextEditor
          value={displayData.personality_json}
          onChange={(content) => isEditing && onEditedDataChange('personality_json', content)}
          campaignId={campaignId}
          placeholder="Describe personality traits, quirks, speech patterns..."
          readonly={!isEditing}
        />
      </div>

    </div>
  );
}
