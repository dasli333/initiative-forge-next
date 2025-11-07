'use client';

import { ImageUpload } from '@/components/shared/ImageUpload';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MapPin, User, Target, Calendar, BookOpen, Package, Users, FileText, Heart, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { NPCStatField } from '../shared/NPCStatField';
import { LanguageSelector } from '../shared/LanguageSelector';
import type { NPCDTO, BacklinkItem } from '@/types/npcs';
import type { JSONContent } from '@tiptap/core';

interface StoryTabProps {
  npc: NPCDTO;
  backlinks?: BacklinkItem[];
  factionName?: string;
  locationName?: string;
  campaignId: string;
  factions: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  isEditing: boolean;
  editedData: {
    role: string;
    faction_id: string | null;
    current_location_id: string | null;
    status: 'alive' | 'dead' | 'unknown';
    image_url: string | null;
    biography_json: JSONContent | null;
    personality_json: JSONContent | null;
    race: string | null;
    age: number | null;
    alignment: 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null;
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

const ALIGNMENT_LABELS: Record<string, string> = {
  LG: 'Lawful Good',
  NG: 'Neutral Good',
  CG: 'Chaotic Good',
  LN: 'Lawful Neutral',
  N: 'Neutral',
  CN: 'Chaotic Neutral',
  LE: 'Lawful Evil',
  NE: 'Neutral Evil',
  CE: 'Chaotic Evil',
};

/**
 * Story tab component for NPC details (Character Sheet style)
 * - Character card header: avatar + stats grid
 * - Editable fields: role, race, age, alignment, faction, location, status, languages, features, secrets
 * - RichTextEditor: biography_json, personality_json
 * - BacklinksSection: list of mentions
 */
export function StoryTab({
  npc,
  backlinks,
  factionName,
  locationName,
  campaignId,
  factions,
  locations,
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
    role: npc.role || '',
    faction_id: npc.faction_id,
    current_location_id: npc.current_location_id,
    status: npc.status,
    image_url: npc.image_url,
    biography_json: npc.biography_json,
    personality_json: npc.personality_json,
    race: npc.race || null,
    age: npc.age || null,
    alignment: npc.alignment as 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null,
    languages: npc.languages || null,
    distinguishing_features: npc.distinguishing_features || null,
    secrets: npc.secrets || null,
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' => {
    if (status === 'alive') return 'default';
    if (status === 'dead') return 'destructive';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Character Card Header */}
      <div className="flex gap-4 p-4 bg-muted/30 rounded-lg border">
        {/* Left: Avatar */}
        <div className="flex-shrink-0">
          {isEditing ? (
            <ImageUpload
              value={displayData.image_url}
              onChange={(url) => onEditedDataChange('image_url', url)}
              campaignId={campaignId}
              entityType="npc"
              maxSizeMB={5}
            />
          ) : displayData.image_url ? (
            <img
              src={displayData.image_url}
              alt={npc.name}
              className="w-40 h-40 rounded-lg object-cover border-2 border-border"
            />
          ) : (
            <div className="w-40 h-40 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center">
              <User className="w-16 h-16 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Right: Stats Grid (View Mode) */}
        {!isEditing && (
          <div className="flex-1 grid grid-cols-2 gap-3">
            <NPCStatField icon={User} label="Role" value={displayData.role} />
            <NPCStatField icon={Shield} label="Race" value={displayData.race} />
            <NPCStatField icon={Calendar} label="Age" value={displayData.age} />
            <NPCStatField
              icon={Target}
              label="Alignment"
              value={displayData.alignment ? ALIGNMENT_LABELS[displayData.alignment] : null}
            />
            <NPCStatField icon={Users} label="Faction" value={factionName} />
            <NPCStatField icon={MapPin} label="Location" value={locationName} />
            <NPCStatField
              icon={Heart}
              label="Status"
              value={displayData.status.charAt(0).toUpperCase() + displayData.status.slice(1)}
              badge
              badgeVariant={getStatusBadgeVariant(displayData.status)}
            />
          </div>
        )}

        {/* Right: Edit Mode Placeholder */}
        {isEditing && (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Edit fields below to update character details
          </div>
        )}
      </div>

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
          {/* Role */}
          <div>
            <label className="text-sm font-medium mb-2 block">Role</label>
            <Input
              value={displayData.role}
              onChange={(e) => onEditedDataChange('role', e.target.value)}
              placeholder="e.g., Merchant, Guard Captain, Wizard"
              disabled={isUpdating}
            />
          </div>

          {/* Race */}
          <div>
            <label className="text-sm font-medium mb-2 block">Race</label>
            <Input
              value={displayData.race || ''}
              onChange={(e) => onEditedDataChange('race', e.target.value || null)}
              placeholder="e.g., Human, Elf, Dwarf, Half-Orc"
              disabled={isUpdating}
            />
          </div>

          {/* Age */}
          <div>
            <label className="text-sm font-medium mb-2 block">Age</label>
            <Input
              type="number"
              value={displayData.age || ''}
              onChange={(e) => onEditedDataChange('age', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g., 35"
              min={0}
              max={10000}
              disabled={isUpdating}
            />
          </div>

          {/* Alignment */}
          <div>
            <label className="text-sm font-medium mb-2 block">Alignment</label>
            <Select
              value={displayData.alignment || 'none'}
              onValueChange={(value) => onEditedDataChange('alignment', value === 'none' ? null : value)}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No alignment</SelectItem>
                <SelectItem value="LG">Lawful Good</SelectItem>
                <SelectItem value="NG">Neutral Good</SelectItem>
                <SelectItem value="CG">Chaotic Good</SelectItem>
                <SelectItem value="LN">Lawful Neutral</SelectItem>
                <SelectItem value="N">Neutral</SelectItem>
                <SelectItem value="CN">Chaotic Neutral</SelectItem>
                <SelectItem value="LE">Lawful Evil</SelectItem>
                <SelectItem value="NE">Neutral Evil</SelectItem>
                <SelectItem value="CE">Chaotic Evil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Faction */}
          <div>
            <label className="text-sm font-medium mb-2 block">Faction</label>
            <Select
              value={displayData.faction_id || 'none'}
              onValueChange={(value) => onEditedDataChange('faction_id', value === 'none' ? null : value)}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select faction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No faction</SelectItem>
                {factions.map((faction) => (
                  <SelectItem key={faction.id} value={faction.id}>
                    {faction.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium mb-2 block">Current Location</label>
            <Select
              value={displayData.current_location_id || 'none'}
              onValueChange={(value) => onEditedDataChange('current_location_id', value === 'none' ? null : value)}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No location</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={displayData.status}
              onValueChange={(value) => onEditedDataChange('status', value)}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alive">Alive</SelectItem>
                <SelectItem value="dead">Dead</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
