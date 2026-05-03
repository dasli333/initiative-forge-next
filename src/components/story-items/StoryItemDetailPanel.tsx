'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Edit2, Trash2, Save, X, Users, User, Building, MapPin, HelpCircle, Sparkles } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { ImageLightbox } from '@/components/shared/ImageLightbox';
import { deleteStoryItemImage } from '@/lib/api/storage';
import { OwnershipTimeline } from './OwnershipTimeline';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateStoryItemSchema, type UpdateStoryItemFormData } from '@/lib/schemas/story-items';
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
  isUpdating = false,
  isDeleting = false,
}: StoryItemDetailPanelProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // React Hook Form for edit mode
  const form = useForm<UpdateStoryItemFormData>({
    resolver: zodResolver(updateStoryItemSchema),
    defaultValues: {
      name: item?.name || '',
      description_json: item?.description_json || null,
      image_url: item?.image_url || null,
      ownership_history_json: (item?.ownership_history_json as unknown as OwnershipHistoryEntry[]) || [],
    },
  });

  // Reset form when item changes or edit mode changes
  useEffect(() => {
    if (item && isEditing) {
      form.reset({
        name: item.name,
        description_json: item.description_json,
        image_url: item.image_url,
        ownership_history_json: (item.ownership_history_json as unknown as OwnershipHistoryEntry[]) || [],
      });
    }
  }, [item, isEditing, form]);

  if (!item && !isLoading) {
    return (
      <EmptyState
        icon={Sparkles}
        title="No Story Item Selected"
        description="Select a story item from the list to view its details."
      />
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
    const formData = form.getValues();
    // Cast form data to match StoryItemDTO partial
    onSave(formData as Partial<StoryItemDTO>);
  };

  const handleCancel = () => {
    // Staged-delete: delete newly-uploaded image if user cancels edit.
    const newUrl = form.getValues().image_url;
    const origUrl = item?.image_url ?? null;
    if (
      typeof newUrl === 'string' &&
      newUrl.startsWith('http') &&
      newUrl !== origUrl
    ) {
      deleteStoryItemImage(newUrl).catch((err) => {
        console.error('Failed to delete abandoned story item image:', err);
      });
    }
    onCancelEdit();
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header Card: Image + Name + Current Owner + Actions */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 flex gap-4 p-4 bg-muted/30 rounded-lg border flex-col sm:flex-row">
            {/* Left: Image */}
            <div className="shrink-0">
              {isEditing ? (
                <div className="w-40">
                  <Controller
                    name="image_url"
                    control={form.control}
                    render={({ field }) => (
                      <ImageUpload
                        value={field.value ?? null}
                        onChange={field.onChange}
                        campaignId={campaignId}
                        entityType="story_item"
                        maxSizeMB={5}
                        className="[&_img]:h-40 [&_img]:w-40"
                        deferStorageDelete
                      />
                    )}
                  />
                </div>
              ) : item.image_url ? (
                <ImageLightbox src={item.image_url} alt={item.name}>
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    width={160}
                    height={160}
                    className="w-40 h-40 rounded-lg object-cover border-2 border-border"
                  />
                </ImageLightbox>
              ) : (
                <div className="w-40 h-40 rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Right: Name + Current Owner */}
            <div className="flex-1 min-w-0 space-y-3">
              {isEditing ? (
                <div>
                  <Label>Name</Label>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder="Item name"
                        className="text-2xl font-bold h-auto py-2"
                      />
                    )}
                  />
                </div>
              ) : (
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  {item.name}
                </h1>
              )}

              {/* Current Owner */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Current Owner
                </h3>
                {!isEditing ? (
                  item.current_owner_type && item.current_owner_id ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="flex items-center gap-2">
                        {getOwnerTypeIcon(item.current_owner_type)}
                        <span>{getOwnerTypeLabel(item.current_owner_type)}</span>
                      </Badge>
                      <Link
                        href={getOwnerTypePath(item.current_owner_type, campaignId, item.current_owner_id)}
                        className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline truncate"
                      >
                        {item.current_owner_name || 'Unknown'}
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No owner assigned</p>
                  )
                ) : (
                  <div className="text-xs text-muted-foreground italic border-l-4 border-emerald-500 pl-3 py-1">
                    Current owner = history entry with no end date. Edit history below to change.
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 shrink-0">
              {!isEditing ? (
                  <>
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
                  </>
              ) : (
                  <>
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
                        onClick={handleCancel}
                        variant="ghost"
                        size="sm"
                        disabled={isUpdating}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
              )}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Description
          </h3>

          {isEditing ? (
            <Controller
              name="description_json"
              control={form.control}
              render={({ field }) => (
                <RichTextEditor
                  value={(field.value as JSONContent) || item.description_json}
                  onChange={field.onChange}
                  campaignId={campaignId}
                  placeholder="Describe this story item..."
                />
              )}
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

        {/* Ownership History Section */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ownership History
          </h3>
          <OwnershipTimeline
            entries={ownershipHistory}
            currentOwner={currentOwner}
            campaignId={campaignId}
            editable={isEditing}
            control={isEditing ? form.control : undefined}
            npcs={npcs}
            playerCharacters={playerCharacters}
            factions={factions}
            locations={locations}
          />
        </div>

        {/* Backlinks section would go here (future enhancement) */}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isDeleting={isDeleting}
        entityName={item.name}
        entityType="Story Item"
      />
    </div>
  );
}
