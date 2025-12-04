'use client';

import Link from 'next/link';
import { Users, User, Building, MapPin, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useFieldArray, Controller, type Control } from 'react-hook-form';
import type { OwnershipHistoryEntry } from '@/types/story-items';
import type { UpdateStoryItemFormData } from '@/lib/schemas/story-items';

interface Owner {
  id: string;
  name: string;
}

interface OwnershipTimelineProps {
  entries: OwnershipHistoryEntry[];
  currentOwner: {
    type: 'npc' | 'player_character' | 'faction' | 'location';
    id: string;
    name: string;
  } | null;
  campaignId: string;
  editable?: boolean;
  control?: Control<UpdateStoryItemFormData>;
  npcs?: Owner[];
  playerCharacters?: Owner[];
  factions?: Owner[];
  locations?: Owner[];
}

/**
 * Get owner type icon
 */
function getOwnerTypeIcon(type: string) {
  switch (type) {
    case 'npc':
      return <User className="h-4 w-4" />;
    case 'player_character':
      return <Users className="h-4 w-4" />;
    case 'faction':
      return <Building className="h-4 w-4" />;
    case 'location':
      return <MapPin className="h-4 w-4" />;
    default:
      return null;
  }
}

/**
 * Get owner type path for navigation
 */
function getOwnerTypePath(type: string, campaignId: string, ownerId: string): string {
  switch (type) {
    case 'npc':
      return `/campaigns/${campaignId}/npcs?selectedId=${ownerId}`;
    case 'player_character':
      return `/campaigns/${campaignId}/characters?selectedId=${ownerId}`;
    case 'faction':
      return `/campaigns/${campaignId}/factions?selectedId=${ownerId}`;
    case 'location':
      return `/campaigns/${campaignId}/locations?selectedId=${ownerId}`;
    default:
      return '#';
  }
}

/**
 * Get owner type label
 */
function getOwnerTypeLabel(type: string): string {
  switch (type) {
    case 'npc':
      return 'NPC';
    case 'player_character':
      return 'Player Character';
    case 'faction':
      return 'Faction';
    case 'location':
      return 'Location';
    default:
      return type;
  }
}

/**
 * Owner Select Component
 */
function OwnerSelect({
  ownerType,
  value,
  onChange,
  npcs = [],
  playerCharacters = [],
  factions = [],
  locations = [],
}: {
  ownerType: string;
  value: string;
  onChange: (value: string) => void;
  npcs: Owner[];
  playerCharacters: Owner[];
  factions: Owner[];
  locations: Owner[];
}) {
  let options: Owner[] = [];
  switch (ownerType) {
    case 'npc':
      options = npcs;
      break;
    case 'player_character':
      options = playerCharacters;
      break;
    case 'faction':
      options = factions;
      break;
    case 'location':
      options = locations;
      break;
  }

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="Select owner" />
      </SelectTrigger>
      <SelectContent>
        {options.map((owner) => (
          <SelectItem key={owner.id} value={owner.id}>
            {owner.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Editable timeline component (uses hooks)
 */
function EditableOwnershipTimeline({
  control,
  npcs,
  playerCharacters,
  factions,
  locations,
}: {
  control: Control<UpdateStoryItemFormData>;
  npcs: Owner[];
  playerCharacters: Owner[];
  factions: Owner[];
  locations: Owner[];
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ownership_history_json',
  });

    return (
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Entry #{index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Owner Type Select */}
              <div className="space-y-1.5">
                <Label htmlFor={`ownership_history_json.${index}.owner_type`}>Owner Type</Label>
                <Controller
                  name={`ownership_history_json.${index}.owner_type`}
                  control={control}
                  render={({ field: controllerField }) => (
                    <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="npc">NPC</SelectItem>
                        <SelectItem value="player_character">Player Character</SelectItem>
                        <SelectItem value="faction">Faction</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Owner Select */}
              <div className="space-y-1.5">
                <Label htmlFor={`ownership_history_json.${index}.owner_id`}>Owner</Label>
                <Controller
                  name={`ownership_history_json.${index}.owner_id`}
                  control={control}
                  render={({ field: controllerField }) => (
                    <OwnerSelect
                      ownerType={field.owner_type}
                      value={controllerField.value}
                      onChange={controllerField.onChange}
                      npcs={npcs}
                      playerCharacters={playerCharacters}
                      factions={factions}
                      locations={locations}
                    />
                  )}
                />
              </div>

              {/* From Date */}
              <div className="space-y-1.5">
                <Label htmlFor={`ownership_history_json.${index}.from`}>From Date</Label>
                <Controller
                  name={`ownership_history_json.${index}.from`}
                  control={control}
                  render={({ field: controllerField }) => (
                    <Input placeholder="e.g., 1370 DR" {...controllerField} />
                  )}
                />
              </div>

              {/* To Date */}
              <div className="space-y-1.5">
                <Label htmlFor={`ownership_history_json.${index}.to`}>To Date (optional)</Label>
                <Controller
                  name={`ownership_history_json.${index}.to`}
                  control={control}
                  render={({ field: controllerField }) => (
                    <Input
                      placeholder="e.g., 1374 DR (or leave empty)"
                      {...controllerField}
                      value={controllerField.value || ''}
                    />
                  )}
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <Label htmlFor={`ownership_history_json.${index}.sort_order`}>Order</Label>
                <Controller
                  name={`ownership_history_json.${index}.sort_order`}
                  control={control}
                  render={({ field: controllerField }) => (
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      {...controllerField}
                      onChange={(e) => controllerField.onChange(parseInt(e.target.value, 10))}
                      className="w-20"
                    />
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor={`ownership_history_json.${index}.notes`}>Notes (optional)</Label>
              <Controller
                name={`ownership_history_json.${index}.notes`}
                control={control}
                render={({ field: controllerField }) => (
                  <Textarea
                    placeholder="Additional context about this ownership period..."
                    maxLength={500}
                    {...controllerField}
                    value={controllerField.value || ''}
                    className="resize-none"
                    rows={2}
                  />
                )}
              />
            </div>
          </div>
        ))}

        {/* Add Entry Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ owner_type: 'npc', owner_id: '', from: '', to: null, sort_order: fields.length, notes: '' })}
          disabled={fields.length >= 10}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry {fields.length >= 10 && '(Max 10 reached)'}
        </Button>

        {fields.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8 border-2 border-dashed rounded-lg">
            No ownership history. Click "Add Entry" to create one.
          </div>
        )}
      </div>
    );
}

/**
 * Read-only timeline component (no hooks)
 */
function ReadOnlyOwnershipTimeline({
  entries,
  currentOwner,
  campaignId,
}: {
  entries: OwnershipHistoryEntry[];
  currentOwner: {
    type: 'npc' | 'player_character' | 'faction' | 'location';
    id: string;
    name: string;
  } | null;
  campaignId: string;
}) {
  // Combine history entries with current owner
  const allEntries = [...entries];

  // Sort by sort_order (fallback to 0 if missing)
  const sortedEntries = allEntries.sort((a, b) => {
    const orderA = a.sort_order ?? 0;
    const orderB = b.sort_order ?? 0;
    return orderA - orderB;
  });

  if (sortedEntries.length === 0 && !currentOwner) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        No ownership history available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedEntries.map((entry, index) => {
        const isCurrentOwner = entry.to === null;
        const period = isCurrentOwner
          ? `${entry.from || 'Unknown'} - Present`
          : `${entry.from || 'Unknown'} - ${entry.to || 'Unknown'}`;

        return (
          <div
            key={`${entry.owner_id}-${index}`}
            className="relative pl-8 pb-6 last:pb-0"
          >
            {/* Timeline line */}
            {index < sortedEntries.length - 1 && (
              <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
            )}

            {/* Timeline dot */}
            <div
              className={cn(
                'absolute left-0 top-1 w-4 h-4 rounded-full border-2',
                isCurrentOwner
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              )}
            />

            {/* Content card */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link
                  href={getOwnerTypePath(entry.owner_type, campaignId, entry.owner_id)}
                  className="font-medium text-gray-900 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {entry.owner_name || 'Unknown Owner'}
                </Link>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getOwnerTypeIcon(entry.owner_type)}
                  <span className="text-xs">{getOwnerTypeLabel(entry.owner_type)}</span>
                </Badge>
                {isCurrentOwner && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs">
                    Current
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {period}
              </p>

              {entry.notes && (
                <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                  {entry.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Main OwnershipTimeline component (wrapper)
 * Conditionally renders EditableOwnershipTimeline or ReadOnlyOwnershipTimeline
 */
export function OwnershipTimeline({
  entries,
  currentOwner,
  campaignId,
  editable = false,
  control,
  npcs = [],
  playerCharacters = [],
  factions = [],
  locations = [],
}: OwnershipTimelineProps) {
  if (editable && control) {
    return (
      <EditableOwnershipTimeline
        control={control}
        npcs={npcs}
        playerCharacters={playerCharacters}
        factions={factions}
        locations={locations}
      />
    );
  }

  return (
    <ReadOnlyOwnershipTimeline
      entries={entries}
      currentOwner={currentOwner}
      campaignId={campaignId}
    />
  );
}
