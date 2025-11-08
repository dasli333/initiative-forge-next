'use client';

import { ImageUpload } from '@/components/shared/ImageUpload';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, User, Target, Calendar, Users, Shield } from 'lucide-react';
import { NPCStatField } from './NPCStatField';
import { TagManager } from './TagManager';
import type { NPCDTO } from '@/types/npcs';
import type { NPCTagDTO } from '@/types/npc-tags';

interface NPCCharacterCardProps {
  npc: NPCDTO;
  campaignId: string;
  factionName?: string;
  locationName?: string;
  factions: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  assignedTags: NPCTagDTO[];
  availableTags: NPCTagDTO[];
  onAssignTag: (tagId: string) => Promise<void>;
  onUnassignTag: (tagId: string) => Promise<void>;
  onCreateTag: (name: string, color: string, icon: string) => Promise<NPCTagDTO>;
  isEditing: boolean;
  editedData: {
    role: string;
    faction_id: string | null;
    current_location_id: string | null;
    status: 'alive' | 'dead' | 'unknown';
    image_url: string | null;
    race: string | null;
    age: number | null;
    alignment: 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null;
  } | null;
  onEditedDataChange: (field: string, value: unknown) => void;
  isUpdating?: boolean;
  showNameInCard?: boolean;
}

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
 * NPC Character Card - Always visible header with key character info
 * - Tags (always visible and editable)
 * - Avatar + Stats Grid (7 fields)
 * - Edit mode: shows form fields below card
 */
export function NPCCharacterCard({
  npc,
  campaignId,
  factionName,
  locationName,
  factions,
  locations,
  assignedTags,
  availableTags,
  onAssignTag,
  onUnassignTag,
  onCreateTag,
  isEditing,
  editedData,
  onEditedDataChange,
  isUpdating = false,
  showNameInCard = true,
}: NPCCharacterCardProps) {
  // Use editedData when editing, npc data when viewing
  const displayData = isEditing && editedData ? editedData : {
    role: npc.role || '',
    faction_id: npc.faction_id,
    current_location_id: npc.current_location_id,
    status: npc.status,
    image_url: npc.image_url,
    race: npc.race || null,
    age: npc.age || null,
    alignment: npc.alignment as 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null,
  };

  return (
    <div className="space-y-4">
      {/* Name + Tags (conditional) */}
      {showNameInCard && (
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{npc.name}</h2>
          <TagManager
            campaignId={campaignId}
            npcId={npc.id}
            assignedTags={assignedTags}
            availableTags={availableTags}
            onAssign={onAssignTag}
            onUnassign={onUnassignTag}
            onCreate={onCreateTag}
            maxTags={5}
          />
        </div>
      )}

      {/* Tags only (when name is shown elsewhere) */}
      {!showNameInCard && (
        <TagManager
          campaignId={campaignId}
          npcId={npc.id}
          assignedTags={assignedTags}
          availableTags={availableTags}
          onAssign={onAssignTag}
          onUnassign={onUnassignTag}
          onCreate={onCreateTag}
          maxTags={5}
        />
      )}

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
          </div>
        )}

        {/* Right: Edit Mode Placeholder */}
        {isEditing && (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Edit fields below to update character details
          </div>
        )}
      </div>

      {/* Edit Mode Fields */}
      {isEditing && (
        <div className="space-y-4">
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
        </div>
      )}
    </div>
  );
}
