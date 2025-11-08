'use client';

import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, User, Target, Calendar, BookOpen, Package, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { LanguageSelector } from '../shared/LanguageSelector';
import type { NPCDTO, BacklinkItem } from '@/types/npcs';
import type { JSONContent } from '@tiptap/core';

interface StoryTabProps {
  npc: NPCDTO;
  backlinks?: BacklinkItem[];
  campaignId: string;
  isEditing: boolean;
  editedData: {
    biography_json: JSONContent | null;
    personality_json: JSONContent | null;
    languages: string[] | null;
    distinguishing_features: string | null;
    secrets: string | null;
  } | null;
  onEditedDataChange: (field: string, value: unknown) => void;
  isUpdating?: boolean;
}

const ENTITY_ICONS = {
  location: MapPin,
  npc: User,
  quest: Target,
  session: Calendar,
  story_arc: BookOpen,
  story_item: Package,
  faction: Users,
  lore_note: FileText,
};

const ENTITY_COLORS = {
  location: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  npc: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  quest: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  session: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  story_arc: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  story_item: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  faction: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  lore_note: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
};

const ENTITY_ROUTE_MAP = {
  location: 'locations',
  npc: 'npcs',
  quest: 'quests',
  session: 'sessions',
  story_arc: 'story-arcs',
  story_item: 'story-items',
  faction: 'factions',
  lore_note: 'lore-notes',
};

/**
 * Story tab component for NPC details
 * - Descriptive fields: languages, distinguishing features, secrets
 * - RichTextEditor: biography_json, personality_json
 * - BacklinksSection: list of mentions
 * Note: Character card (name, avatar, stats) moved to parent component
 */
export function StoryTab({
  npc,
  backlinks,
  campaignId,
  isEditing,
  editedData,
  onEditedDataChange,
  isUpdating = false,
}: StoryTabProps) {
  const router = useRouter();

  const handleBacklinkClick = (backlink: BacklinkItem) => {
    const route = ENTITY_ROUTE_MAP[backlink.source_type as keyof typeof ENTITY_ROUTE_MAP];
    if (route) {
      router.push(`/campaigns/${campaignId}/${route}?selectedId=${backlink.source_id}`);
    }
  };

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

      {/* Secrets (View Mode) */}
      {!isEditing && displayData.secrets && (
        <div className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50 dark:bg-amber-950/20 rounded">
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Secrets (GM Only)
          </label>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap">
            {displayData.secrets}
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

          {/* Secrets */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Secrets (GM Only)
            </label>
            <Textarea
              value={displayData.secrets || ''}
              onChange={(e) => onEditedDataChange('secrets', e.target.value || null)}
              placeholder="Secret motivations, hidden allegiances, plot hooks..."
              disabled={isUpdating}
              rows={4}
              className="border-amber-300 dark:border-amber-700"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This information is for the GM only and should not be shared with players
            </p>
          </div>
        </>
      )}

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

      {/* Backlinks Section */}
      <Card>
        <CardHeader>
          <CardTitle>Mentioned In</CardTitle>
          <CardDescription>
            Other entities that reference this NPC
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!backlinks || backlinks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No mentions yet. Use @mentions in other entities to reference this NPC.
            </p>
          ) : (
            <div className="space-y-2">
              {backlinks.map((backlink) => {
                const Icon = ENTITY_ICONS[backlink.source_type as keyof typeof ENTITY_ICONS];
                const colorClass = ENTITY_COLORS[backlink.source_type as keyof typeof ENTITY_COLORS];

                return (
                  <button
                    key={`${backlink.source_type}-${backlink.source_id}`}
                    onClick={() => handleBacklinkClick(backlink)}
                    className={cn(
                      'flex items-center gap-2 w-full p-3 rounded-lg border transition-colors text-left',
                      'hover:bg-muted'
                    )}
                  >
                    <div className={cn('rounded-full p-2', colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {backlink.source_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {backlink.source_type.replace('_', ' ')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
