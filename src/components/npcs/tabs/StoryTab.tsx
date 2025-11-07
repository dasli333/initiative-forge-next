'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, User, Target, Calendar, BookOpen, Package, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import type { NPCDetailsViewModel } from '@/types/npcs';
import type { JSONContent } from '@tiptap/core';

interface StoryTabProps {
  viewModel: NPCDetailsViewModel;
  campaignId: string;
  factions: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  onFieldUpdate: (field: string, value: unknown) => void;
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
 * - Image display/upload (ImageUpload component)
 * - Inline edit: role (auto-save on blur)
 * - Dropdowns: faction, location, status (onChange → mutation)
 * - RichTextEditor: biography_json, personality_json (auto-save on blur)
 * - BacklinksSection: list of mentions
 */
export function StoryTab({
  viewModel,
  campaignId,
  factions,
  locations,
  onFieldUpdate,
  isUpdating = false,
}: StoryTabProps) {
  const { npc, backlinks } = viewModel;
  const router = useRouter();

  const [role, setRole] = useState(npc.role || '');

  const handleRoleBlur = () => {
    if (role !== (npc.role || '')) {
      onFieldUpdate('role', role || null);
    }
  };


  const handleBiographyChange = (content: JSONContent) => {
    onFieldUpdate('biography_json', content);
  };

  const handlePersonalityChange = (content: JSONContent) => {
    onFieldUpdate('personality_json', content);
  };

  const handleBacklinkClick = (backlink: typeof backlinks[0]) => {
    const route = ENTITY_ROUTE_MAP[backlink.source_type as keyof typeof ENTITY_ROUTE_MAP];
    if (route) {
      router.push(`/campaigns/${campaignId}/${route}?selectedId=${backlink.source_id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="text-sm font-medium mb-2 block">Image</label>
        <ImageUpload
          value={npc.image_url}
          onChange={(url) => onFieldUpdate('image_url', url)}
          campaignId={campaignId}
          maxSizeMB={5}
        />
      </div>

      {/* Role Input */}
      <div>
        <label className="text-sm font-medium mb-2 block">Role</label>
        <Input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          onBlur={handleRoleBlur}
          placeholder="e.g., Merchant, Guard Captain, Wizard"
          disabled={isUpdating}
        />
      </div>

      {/* Faction Dropdown */}
      <div>
        <label className="text-sm font-medium mb-2 block">Faction</label>
        <Select
          value={npc.faction_id || 'none'}
          onValueChange={(value) => onFieldUpdate('faction_id', value === 'none' ? null : value)}
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

      {/* Location Dropdown */}
      <div>
        <label className="text-sm font-medium mb-2 block">Current Location</label>
        <Select
          value={npc.current_location_id || 'none'}
          onValueChange={(value) => onFieldUpdate('current_location_id', value === 'none' ? null : value)}
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

      {/* Status Dropdown */}
      <div>
        <label className="text-sm font-medium mb-2 block">Status</label>
        <Select
          value={npc.status}
          onValueChange={(value) => onFieldUpdate('status', value)}
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

      {/* Biography RichTextEditor */}
      <div>
        <label className="text-sm font-medium mb-2 block">Biography</label>
        <RichTextEditor
          value={npc.biography_json}
          onChange={handleBiographyChange}
          campaignId={campaignId}
          placeholder="Write the NPC's backstory and biography..."
          readonly={isUpdating}
        />
      </div>

      {/* Personality RichTextEditor */}
      <div>
        <label className="text-sm font-medium mb-2 block">Personality</label>
        <RichTextEditor
          value={npc.personality_json}
          onChange={handlePersonalityChange}
          campaignId={campaignId}
          placeholder="Describe personality traits, mannerisms, speech patterns..."
          readonly={isUpdating}
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
