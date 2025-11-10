'use client';

import { ImageUpload } from '@/components/shared/ImageUpload';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Target, Calendar, Users, Shield, BookOpen, TrendingUp, Activity } from 'lucide-react';
import { PCStatField } from './PCStatField';
import type { PlayerCharacterDetailsViewModel, PlayerCharacterStatus } from '@/types/player-characters';
import type { JSONContent } from '@tiptap/core';

interface PCCharacterCardProps {
  viewModel: PlayerCharacterDetailsViewModel;
  campaignId: string;
  factions: Array<{ id: string; name: string }>;
  isEditing: boolean;
  editedData: {
    class: string | null;
    level: number | null;
    race: string | null;
    background: string | null;
    alignment: 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null;
    age: number | null;
    faction_id: string | null;
    image_url: string | null;
    status: PlayerCharacterStatus;
    biography_json: JSONContent | null;
    personality_json: JSONContent | null;
    notes: JSONContent | null;
    languages: string[] | null;
    combatStats: {
      hp_max: number;
      armor_class: number;
      speed: number;
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    } | null;
  } | null;
  onEditedDataChange: (field: string, value: unknown) => void;
  isUpdating?: boolean;
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

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  retired: 'Retired',
  deceased: 'Deceased',
};

/**
 * PC Character Card - Always visible header with key character info
 * - Avatar + Stats Grid (8 fields)
 * - Edit mode: shows form fields in grid
 */
export function PCCharacterCard({
  viewModel,
  campaignId,
  factions,
  isEditing,
  editedData,
  onEditedDataChange,
  isUpdating = false,
}: PCCharacterCardProps) {
  // Use editedData when editing, viewModel data when viewing
  const displayData = isEditing && editedData ? editedData : {
    class: viewModel.class || null,
    level: viewModel.level || null,
    race: viewModel.race || null,
    background: viewModel.background || null,
    alignment: viewModel.alignment as 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null,
    age: viewModel.age || null,
    faction_id: viewModel.faction_id,
    image_url: viewModel.image_url,
    status: viewModel.status,
  };

  const factionName = factions.find(f => f.id === displayData.faction_id)?.name;

  return (
    <div className="space-y-4">
      {/* Character Card */}
      <div className="flex gap-4 p-4 bg-muted/30 rounded-lg border">
        {/* Left: Avatar */}
        <div className="flex-shrink-0">
          {isEditing ? (
            <div className="w-40">
              <ImageUpload
                value={displayData.image_url}
                onChange={(url) => onEditedDataChange('image_url', url)}
                campaignId={campaignId}
                entityType="player_character"
                maxSizeMB={5}
                className="[&_img]:h-40 [&_img]:w-40"
              />
            </div>
          ) : displayData.image_url ? (
            <img
              src={displayData.image_url}
              alt={viewModel.name}
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
            <PCStatField icon={User} label="Class" value={displayData.class} />
            <PCStatField icon={TrendingUp} label="Level" value={displayData.level} />
            <PCStatField icon={Shield} label="Race" value={displayData.race} />
            <PCStatField icon={Calendar} label="Age" value={displayData.age} />
            <PCStatField icon={BookOpen} label="Background" value={displayData.background} />
            <PCStatField icon={Users} label="Faction" value={factionName} />
            <PCStatField
              icon={Target}
              label="Alignment"
              value={displayData.alignment ? ALIGNMENT_LABELS[displayData.alignment] : null}
            />
            <PCStatField
              icon={Activity}
              label="Status"
              value={STATUS_LABELS[displayData.status]}
              badge
              badgeVariant={
                displayData.status === 'active' ? 'default' :
                displayData.status === 'deceased' ? 'destructive' :
                'secondary'
              }
            />
          </div>
        )}

        {/* Right: Edit Mode Grid */}
        {isEditing && (
          <div className="flex-1 grid grid-cols-2 gap-3">
            {/* Class */}
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Class</label>
              <Input
                value={displayData.class || ''}
                onChange={(e) => onEditedDataChange('class', e.target.value || null)}
                placeholder="e.g., Fighter"
                disabled={isUpdating}
                className="h-9 text-sm"
              />
            </div>

            {/* Level */}
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Level</label>
              <Input
                type="number"
                value={displayData.level || ''}
                onChange={(e) => onEditedDataChange('level', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="1"
                min={1}
                max={20}
                disabled={isUpdating}
                className="h-9 text-sm"
              />
            </div>

            {/* Race */}
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Race</label>
              <Input
                value={displayData.race || ''}
                onChange={(e) => onEditedDataChange('race', e.target.value || null)}
                placeholder="e.g., Human"
                disabled={isUpdating}
                className="h-9 text-sm"
              />
            </div>

            {/* Age */}
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Age</label>
              <Input
                type="number"
                value={displayData.age || ''}
                onChange={(e) => onEditedDataChange('age', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="25"
                min={0}
                max={10000}
                disabled={isUpdating}
                className="h-9 text-sm"
              />
            </div>

            {/* Background */}
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Background</label>
              <Input
                value={displayData.background || ''}
                onChange={(e) => onEditedDataChange('background', e.target.value || null)}
                placeholder="e.g., Soldier"
                disabled={isUpdating}
                className="h-9 text-sm"
              />
            </div>

            {/* Faction */}
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Faction</label>
              <Select
                value={displayData.faction_id || 'none'}
                onValueChange={(value) => onEditedDataChange('faction_id', value === 'none' ? null : value)}
                disabled={isUpdating}
              >
                <SelectTrigger className="h-9 text-sm">
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

            {/* Alignment */}
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Alignment</label>
              <Select
                value={displayData.alignment || 'none'}
                onValueChange={(value) => onEditedDataChange('alignment', value === 'none' ? null : value)}
                disabled={isUpdating}
              >
                <SelectTrigger className="h-9 text-sm">
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

            {/* Status */}
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Status</label>
              <Select
                value={displayData.status}
                onValueChange={(value) => onEditedDataChange('status', value)}
                disabled={isUpdating}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
