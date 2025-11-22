'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Scroll, Edit, Save, X, Trash2 } from 'lucide-react';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { TagManager } from './shared/TagManager';
import { getCategoryIcon, getCategoryColor } from '@/lib/utils/loreNoteUtils';
import { LORE_NOTE_CATEGORIES, type LoreNoteDTO, type LoreNoteCategory } from '@/types/lore-notes';
import type { LoreNoteTagDTO, TagIcon } from '@/types/lore-note-tags';
import type { JSONContent } from '@tiptap/react';

interface LoreNoteDetailPanelProps {
  noteId: string | null;
  note: LoreNoteDTO | undefined;
  campaignId: string;
  isLoading: boolean;
  isEditing: boolean;
  editedData: {
    title: string;
    category: LoreNoteCategory;
    content_json: JSONContent | null;
  } | null;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditedDataChange: (field: string, value: unknown) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  availableTags: LoreNoteTagDTO[];
  assignedTags: LoreNoteTagDTO[];
  onAssignTag: (tagId: string) => Promise<void>;
  onUnassignTag: (tagId: string) => Promise<void>;
  onCreateTag: (name: string, color: string, icon: TagIcon) => Promise<LoreNoteTagDTO>;
}

export function LoreNoteDetailPanel({
  noteId,
  note,
  campaignId,
  isLoading,
  isEditing,
  editedData,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  onEditedDataChange,
  isUpdating,
  isDeleting,
  availableTags,
  assignedTags,
  onAssignTag,
  onUnassignTag,
  onCreateTag,
}: LoreNoteDetailPanelProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Helper to render category icon inline
  const renderCategoryIcon = () => {
    if (!note) return null;
    const Icon = getCategoryIcon(note.category as LoreNoteCategory);
    return <Icon className="h-3.5 w-3.5" />;
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await onDelete();
    setIsDeleteDialogOpen(false);
  };

  // Empty state (no note selected)
  if (!noteId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Scroll className="h-16 w-16 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No Lore Note Selected</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a note from the list to view details, or create a new one to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-4 p-6">
        <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-6 w-1/4 animate-pulse rounded bg-muted" />
        <div className="flex-1 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  // Not found state
  if (!note) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Scroll className="h-16 w-16 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Note Not Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This lore note may have been deleted or you don't have access to it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          {/* Title & Category */}
          <div className="flex-1 space-y-2">
            {isEditing && editedData ? (
              <>
                <Input
                  value={editedData.title}
                  onChange={(e) => onEditedDataChange('title', e.target.value)}
                  placeholder="Note title"
                  className="text-xl font-semibold"
                />
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Select
                    value={editedData.category}
                    onValueChange={(value) => onEditedDataChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LORE_NOTE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-xl font-semibold">{note.title}</h1>
                <div
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm ${getCategoryColor(note.category as LoreNoteCategory)}`}
                >
                  {renderCategoryIcon()}
                  {note.category}
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={onSave}
                  disabled={isUpdating}
                  size="sm"
                  className="gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={onCancelEdit}
                  disabled={isUpdating}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={onEdit} variant="outline" size="sm" className="gap-1.5">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  onClick={handleDeleteClick}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:bg-destructive/10"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tags - always visible and editable */}
        {note && (
          <div className="mt-4">
            <TagManager
              campaignId={campaignId}
              loreNoteId={noteId!}
              assignedTags={assignedTags}
              availableTags={availableTags}
              onAssign={onAssignTag}
              onUnassign={onUnassignTag}
              onCreate={onCreateTag}
              maxTags={20}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl">
          {isEditing && editedData ? (
            <div className="space-y-1">
              <Label>Content</Label>
              <RichTextEditor
                value={editedData.content_json}
                onChange={(content) => onEditedDataChange('content_json', content)}
                campaignId={campaignId}
                placeholder="Write your lore note content..."
              />
            </div>
          ) : (
            <>
              {note.content_json ? (
                <RichTextEditor
                  value={note.content_json}
                  onChange={() => {}}
                  campaignId={campaignId}
                  readonly={true}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No content</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lore Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{note.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
