'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Edit2, Trash2, Save, X, Users, User, Building, MapPin, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { OwnershipTimeline } from './OwnershipTimeline';
import type { StoryItemDTO, OwnershipHistoryEntry } from '@/types/story-items';
import type { JSONContent } from '@tiptap/core';

interface Owner {
  id: string;
  name: string;
}

interface StoryItemDetailPanelProps {
  item: StoryItemDTO | null;
  isLoading: boolean;
  campaignId: string;
  // Owner data
  npcs: Owner[];
  playerCharacters: Owner[];
  factions: Owner[];
  locations: Owner[];
  // Edit handlers
  onEdit: () => void;
  onSave: (data: Partial<StoryItemDTO>) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  // Edit state
  isEditing: boolean;
  editedData: Partial<StoryItemDTO> | null;
  onEditedDataChange: (field: string, value: unknown) => void;
  // Action states
  isUpdating?: boolean;
  isDeleting?: boolean;
}

/**
 * Get owner type icon
 */
function getOwnerTypeIcon(type: string | null) {
  switch (type) {
    case 'npc':
      return <User className="h-4 w-4" />;
    case 'player_character':
      return <Users className="h-4 w-4" />;
    case 'faction':
      return <Building className="h-4 w-4" />;
    case 'location':
      return <MapPin className="h-4 w-4" />;
    case 'unknown':
      return <HelpCircle className="h-4 w-4" />;
    default:
      return null;
  }
}

/**
 * Get owner type path
 */
function getOwnerTypePath(type: string | null, campaignId: string, ownerId: string): string {
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
function getOwnerTypeLabel(type: string | null): string {
  switch (type) {
    case 'npc':
      return 'NPC';
    case 'player_character':
      return 'Player Character';
    case 'faction':
      return 'Faction';
    case 'location':
      return 'Location';
    case 'unknown':
      return 'Unknown';
    default:
      return 'None';
  }
}

/**
 * Detail panel for story item (right side)
 * Shows NoSelectionState, ViewMode, or EditMode
 */
export function StoryItemDetailPanel({
  item,
  isLoading,
  campaignId,
  npcs,
  playerCharacters,
  factions,
  locations,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  isEditing,
  editedData,
  onEditedDataChange,
  isUpdating = false,
  isDeleting = false,
}: StoryItemDetailPanelProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // No selection state
  if (!item && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div className="flex flex-col items-center">
          <Sparkles className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No Story Item Selected
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Select a story item from the list to view its details
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !item) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  // Get owner options based on selected type
  const getOwnerOptions = () => {
    const ownerType = isEditing ? editedData?.current_owner_type : item.current_owner_type;
    switch (ownerType) {
      case 'npc':
        return npcs;
      case 'player_character':
        return playerCharacters;
      case 'faction':
        return factions;
      case 'location':
        return locations;
      default:
        return [];
    }
  };

  const ownerOptions = getOwnerOptions();
  const showOwnerSelect = isEditing && editedData?.current_owner_type && editedData.current_owner_type !== 'unknown';

  // Parse ownership history
  const ownershipHistory: OwnershipHistoryEntry[] = (item.ownership_history_json as unknown as OwnershipHistoryEntry[]) || [];

  // Current owner for timeline
  const currentOwner = item.current_owner_type && item.current_owner_id && item.current_owner_name
    ? {
        type: item.current_owner_type as 'npc' | 'player_character' | 'faction' | 'location',
        id: item.current_owner_id,
        name: item.current_owner_name,
      }
    : null;

  const handleSave = () => {
    if (!editedData) return;
    onSave(editedData);
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Image */}
        {isEditing ? (
          <div>
            <Label>Image</Label>
            <ImageUpload
              value={editedData?.image_url || item.image_url}
              onChange={(url) => onEditedDataChange('image_url', url)}
              campaignId={campaignId}
              entityType="story_item"
              maxSizeMB={5}
            />
          </div>
        ) : item.image_url ? (
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
        ) : null}

        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            {isEditing ? (
              <div className="flex-1">
                <Label>Name</Label>
                <Input
                  value={editedData?.name ?? item.name}
                  onChange={(e) => onEditedDataChange('name', e.target.value)}
                  placeholder="Item name"
                  className="text-2xl font-bold h-auto py-2"
                />
              </div>
            ) : (
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex-1">
                {item.name}
              </h1>
            )}

            {/* Action buttons */}
            {!isEditing ? (
              <div className="flex gap-2">
                <Button
                  onClick={onEdit}
                  variant="outline"
                  size="sm"
                  disabled={isUpdating || isDeleting}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                  size="sm"
                  disabled={isUpdating || isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  size="sm"
                  disabled={isUpdating}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={onCancelEdit}
                  variant="ghost"
                  size="sm"
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Current Owner Section */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Current Owner
          </h3>

          {isEditing ? (
            <div className="space-y-3">
              {/* Owner Type Select */}
              <div>
                <Label>Owner Type</Label>
                <Select
                  value={editedData?.current_owner_type || 'none'}
                  onValueChange={(value) => {
                    if (value === 'none') {
                      onEditedDataChange('current_owner_type', null);
                      onEditedDataChange('current_owner_id', null);
                    } else {
                      onEditedDataChange('current_owner_type', value);
                      onEditedDataChange('current_owner_id', null); // Reset owner ID
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Owner</SelectItem>
                    <SelectItem value="npc">NPC</SelectItem>
                    <SelectItem value="player_character">Player Character</SelectItem>
                    <SelectItem value="faction">Faction</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Owner ID Select (conditional) */}
              {showOwnerSelect && (
                <div>
                  <Label>Specific Owner</Label>
                  <Select
                    value={editedData?.current_owner_id || ''}
                    onValueChange={(value) => onEditedDataChange('current_owner_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerOptions.map((owner) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ) : item.current_owner_type && item.current_owner_id ? (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-2">
                {getOwnerTypeIcon(item.current_owner_type)}
                <span>{getOwnerTypeLabel(item.current_owner_type)}</span>
              </Badge>
              <Link
                href={getOwnerTypePath(item.current_owner_type, campaignId, item.current_owner_id)}
                className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {item.current_owner_name || 'Unknown'}
              </Link>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No owner assigned</p>
          )}
        </div>

        {/* Description Section */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Description
          </h3>

          {isEditing ? (
            <RichTextEditor
              value={editedData?.description_json as JSONContent || item.description_json}
              onChange={(content) => onEditedDataChange('description_json', content)}
              campaignId={campaignId}
              placeholder="Describe this story item..."
            />
          ) : item.description_json ? (
            <RichTextEditor
              value={item.description_json}
              onChange={() => {}}
              campaignId={campaignId}
              readonly={true}
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              No description provided
            </p>
          )}
        </div>

        {/* Ownership History Section (View Mode Only) */}
        {!isEditing && (
          <div className="space-y-3 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Ownership History
            </h3>
            <OwnershipTimeline
              entries={ownershipHistory}
              currentOwner={currentOwner}
              campaignId={campaignId}
            />
          </div>
        )}

        {/* Backlinks section would go here (future enhancement) */}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{item.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
