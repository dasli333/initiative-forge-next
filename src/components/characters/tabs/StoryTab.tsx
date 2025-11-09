'use client';

import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LanguageSelector } from '@/components/npcs/shared/LanguageSelector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PlayerCharacterDetailsViewModel } from '@/types/player-characters';
import type { JSONContent } from '@tiptap/core';

interface StoryTabProps {
  isEditing: boolean;
  editedData: {
    class: string | null;
    level: number | null;
    race: string | null;
    background: string | null;
    alignment: string | null;
    age: number | null;
    languages: string[] | null;
    faction_id: string | null;
    image_url: string | null;
    biography_json: JSONContent | null;
    personality_json: JSONContent | null;
    status: 'active' | 'retired' | 'deceased';
  } | null;
  viewModel: PlayerCharacterDetailsViewModel | null;
  onFieldChange: (field: string, value: unknown) => void;
  campaignId: string;
  factions: Array<{ id: string; name: string }>;
}

const ALIGNMENTS = [
  { value: 'LG', label: 'Lawful Good' },
  { value: 'NG', label: 'Neutral Good' },
  { value: 'CG', label: 'Chaotic Good' },
  { value: 'LN', label: 'Lawful Neutral' },
  { value: 'N', label: 'True Neutral' },
  { value: 'CN', label: 'Chaotic Neutral' },
  { value: 'LE', label: 'Lawful Evil' },
  { value: 'NE', label: 'Neutral Evil' },
  { value: 'CE', label: 'Chaotic Evil' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'retired', label: 'Retired' },
  { value: 'deceased', label: 'Deceased' },
];

/**
 * Story tab component for Player Character details
 * - Character sheet fields: class, level, race, background, alignment, age, languages, faction, status
 * - Biography (RichTextEditor with @mentions)
 * - Personality (RichTextEditor with @mentions)
 * - Image upload (ImageUpload component)
 */
export function StoryTab({
  isEditing,
  editedData,
  viewModel,
  onFieldChange,
  campaignId,
  factions,
}: StoryTabProps) {
  if (!viewModel) return null;

  // Use editedData when editing, viewModel when viewing
  const displayData = isEditing && editedData ? editedData : {
    class: viewModel.class,
    level: viewModel.level,
    race: viewModel.race,
    background: viewModel.background,
    alignment: viewModel.alignment,
    age: viewModel.age,
    languages: viewModel.languages,
    faction_id: viewModel.faction_id,
    image_url: viewModel.image_url,
    biography_json: viewModel.biography_json,
    personality_json: viewModel.personality_json,
    status: viewModel.status,
  };

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <div>
        <Label>Character Image</Label>
        <ImageUpload
          value={displayData.image_url}
          onChange={(url) => isEditing && onFieldChange('image_url', url)}
          campaignId={campaignId}
          entityType="player_character"
          className="mt-2"
        />
      </div>

      {/* Character Sheet Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Class */}
        <div>
          <Label htmlFor="class">Class</Label>
          {isEditing ? (
            <Input
              id="class"
              value={displayData.class || ''}
              onChange={(e) => onFieldChange('class', e.target.value || null)}
              placeholder="e.g., Fighter, Wizard, Rogue"
            />
          ) : (
            <p className="text-sm text-foreground/90 mt-1">
              {displayData.class || '—'}
            </p>
          )}
        </div>

        {/* Level */}
        <div>
          <Label htmlFor="level">Level</Label>
          {isEditing ? (
            <Input
              id="level"
              type="number"
              value={displayData.level || ''}
              onChange={(e) => onFieldChange('level', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="1-20"
              min={1}
              max={20}
            />
          ) : (
            <p className="text-sm text-foreground/90 mt-1">
              {displayData.level || '—'}
            </p>
          )}
        </div>

        {/* Race */}
        <div>
          <Label htmlFor="race">Race</Label>
          {isEditing ? (
            <Input
              id="race"
              value={displayData.race || ''}
              onChange={(e) => onFieldChange('race', e.target.value || null)}
              placeholder="e.g., Human, Elf, Dwarf"
            />
          ) : (
            <p className="text-sm text-foreground/90 mt-1">
              {displayData.race || '—'}
            </p>
          )}
        </div>

        {/* Background */}
        <div>
          <Label htmlFor="background">Background</Label>
          {isEditing ? (
            <Input
              id="background"
              value={displayData.background || ''}
              onChange={(e) => onFieldChange('background', e.target.value || null)}
              placeholder="e.g., Soldier, Noble, Criminal"
            />
          ) : (
            <p className="text-sm text-foreground/90 mt-1">
              {displayData.background || '—'}
            </p>
          )}
        </div>

        {/* Alignment */}
        <div>
          <Label htmlFor="alignment">Alignment</Label>
          {isEditing ? (
            <Select
              value={displayData.alignment || '__none__'}
              onValueChange={(value) => onFieldChange('alignment', value === '__none__' ? null : value)}
            >
              <SelectTrigger id="alignment">
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {ALIGNMENTS.map((alignment) => (
                  <SelectItem key={alignment.value} value={alignment.value}>
                    {alignment.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-foreground/90 mt-1">
              {displayData.alignment
                ? ALIGNMENTS.find((a) => a.value === displayData.alignment)?.label
                : '—'}
            </p>
          )}
        </div>

        {/* Age */}
        <div>
          <Label htmlFor="age">Age</Label>
          {isEditing ? (
            <Input
              id="age"
              type="number"
              value={displayData.age || ''}
              onChange={(e) => onFieldChange('age', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="e.g., 25"
              min={1}
            />
          ) : (
            <p className="text-sm text-foreground/90 mt-1">
              {displayData.age || '—'}
            </p>
          )}
        </div>

        {/* Faction */}
        <div>
          <Label htmlFor="faction">Faction</Label>
          {isEditing ? (
            <Select
              value={displayData.faction_id || '__none__'}
              onValueChange={(value) => onFieldChange('faction_id', value === '__none__' ? null : value)}
            >
              <SelectTrigger id="faction">
                <SelectValue placeholder="Select faction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No faction</SelectItem>
                {factions.map((faction) => (
                  <SelectItem key={faction.id} value={faction.id}>
                    {faction.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-foreground/90 mt-1">
              {viewModel.faction_name || '—'}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status">Status</Label>
          {isEditing ? (
            <Select
              value={displayData.status}
              onValueChange={(value: 'active' | 'retired' | 'deceased') => onFieldChange('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-foreground/90 mt-1 capitalize">
              {displayData.status}
            </p>
          )}
        </div>
      </div>

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
