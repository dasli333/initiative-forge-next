'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { LoreNotesLayout } from '@/components/lore-notes/LoreNotesLayout';
import { LoreNoteFormDialog } from '@/components/lore-notes/forms/LoreNoteFormDialog';
import { useCampaignStore } from '@/stores/campaignStore';
import {
  useLoreNotesQuery,
  useLoreNoteQuery,
  useCreateLoreNoteMutation,
  useUpdateLoreNoteMutation,
  useDeleteLoreNoteMutation,
} from '@/hooks/useLoreNotes';
import {
  useLoreNoteTagsQuery,
  useLoreNoteAssignedTagsQuery,
  useAssignTagToLoreNoteMutation,
  useUnassignTagFromLoreNoteMutation,
  useCreateLoreNoteTagMutation,
} from '@/hooks/useLoreNoteTags';
import type { LoreNoteFilters, LoreNoteCategory, LoreNoteCardViewModel } from '@/types/lore-notes';
import type { LoreNoteFormData } from '@/lib/schemas/lore-notes';
import type { JSONContent } from '@tiptap/react';
import type { TagIcon } from '@/types/lore-note-tags';

/**
 * Main Lore Notes page - 30/70 split view
 * Left: filterable note list
 * Right: detail panel with inline editing
 */
export default function LoreNotesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = params.id as string;

  // Get campaign from store
  const { selectedCampaign } = useCampaignStore();

  // Derive state from URL params (no sync needed)
  const selectedNoteId = searchParams.get('selectedId') || null;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<LoreNoteFilters>({});

  // Edit mode state for detail panel
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<{
    title: string;
    category: LoreNoteCategory;
    content_json: JSONContent | null;
  } | null>(null);

  // Queries
  const { data: notes = [], isLoading: notesLoading } = useLoreNotesQuery(campaignId, filters);
  const { data: noteDetails, isLoading: detailsLoading } = useLoreNoteQuery(selectedNoteId || undefined);
  const { data: tags = [] } = useLoreNoteTagsQuery(campaignId);
  const { data: assignedTags = [] } = useLoreNoteAssignedTagsQuery(selectedNoteId || undefined);

  // Convert notes to card view models with tags
  const notesWithTags: LoreNoteCardViewModel[] = useMemo(() => {
    if (!notes) return [];

    return notes.map((note) => {
      // Extract tags from JOIN result
      const noteTags = (note as import('@/types/lore-notes').LoreNoteWithJoins).lore_note_tag_assignments?.map((assignment) => assignment.lore_note_tags).filter(Boolean) || [];

      return {
        note,
        tags: noteTags,
      };
    });
  }, [notes]);

  // Mutations
  const createMutation = useCreateLoreNoteMutation(campaignId);
  const updateMutation = useUpdateLoreNoteMutation(campaignId);
  const deleteMutation = useDeleteLoreNoteMutation(campaignId);
  const assignTagMutation = useAssignTagToLoreNoteMutation();
  const unassignTagMutation = useUnassignTagFromLoreNoteMutation();
  const createTagMutation = useCreateLoreNoteTagMutation(campaignId);

  // Handlers
  const handleNoteSelect = useCallback(
    (noteId: string) => {
      router.push(`/campaigns/${campaignId}/lore-notes?selectedId=${noteId}`, { scroll: false });
    },
    [campaignId, router]
  );

  const handleCreateNote = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  const handleEdit = useCallback(() => {
    if (noteDetails) {
      setEditedData({
        title: noteDetails.title,
        category: noteDetails.category as LoreNoteCategory,
        content_json: noteDetails.content_json,
      });
      setIsEditing(true);
    }
  }, [noteDetails]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedData(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editedData || !selectedNoteId || !noteDetails) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedNoteId,
        command: {
          title: editedData.title !== noteDetails.title ? editedData.title : undefined,
          category: editedData.category !== noteDetails.category ? editedData.category : undefined,
          content_json: editedData.content_json,
        },
      });
      setIsEditing(false);
      setEditedData(null);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  }, [editedData, selectedNoteId, noteDetails, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!selectedNoteId) return;

    try {
      await deleteMutation.mutateAsync(selectedNoteId);
      router.push(`/campaigns/${campaignId}/lore-notes`, { scroll: false });
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }, [selectedNoteId, deleteMutation, router, campaignId]);

  const handleEditedDataChange = useCallback((field: string, value: unknown) => {
    setEditedData((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  }, []);

  const handleCreateSubmit = useCallback(
    async (data: LoreNoteFormData) => {
      try {
        const newNote = await createMutation.mutateAsync({
          title: data.title,
          category: data.category,
          content_json: data.content_json || null,
        });
        setIsCreateDialogOpen(false);
        // Select newly created note via URL
        router.push(`/campaigns/${campaignId}/lore-notes?selectedId=${newNote.id}`, { scroll: false });
      } catch (error) {
        console.error('Failed to create note:', error);
      }
    },
    [createMutation, router, campaignId]
  );

  const handleAssignTag = useCallback(
    async (tagId: string) => {
      if (!selectedNoteId) return;
      await assignTagMutation.mutateAsync({
        lore_note_id: selectedNoteId,
        tag_id: tagId,
      });
    },
    [selectedNoteId, assignTagMutation]
  );

  const handleUnassignTag = useCallback(
    async (tagId: string) => {
      if (!selectedNoteId) return;
      await unassignTagMutation.mutateAsync({
        lore_note_id: selectedNoteId,
        tag_id: tagId,
      });
    },
    [selectedNoteId, unassignTagMutation]
  );

  const handleCreateTag = useCallback(
    async (name: string, color: string, icon: TagIcon) => {
      return await createTagMutation.mutateAsync({ name, color, icon });
    },
    [createTagMutation]
  );

  // Loading campaign
  if (!selectedCampaign) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold">Lore Notes</h1>
        <p className="text-sm text-muted-foreground">
          Document your campaign's history, geography, legends, and more
        </p>
      </div>

      {/* Main content */}
      <LoreNotesLayout
        notes={notesWithTags}
        selectedNoteId={selectedNoteId}
        onNoteSelect={handleNoteSelect}
        onCreateNote={handleCreateNote}
        filters={filters}
        onFiltersChange={setFilters}
        isLoading={notesLoading}
        selectedNote={noteDetails}
        isDetailLoading={detailsLoading}
        isEditing={isEditing}
        editedData={editedData}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancelEdit={handleCancelEdit}
        onDelete={handleDelete}
        onEditedDataChange={handleEditedDataChange}
        campaignId={campaignId}
        isUpdating={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
        availableTags={tags}
        assignedTags={assignedTags}
        onAssignTag={handleAssignTag}
        onUnassignTag={handleUnassignTag}
        onCreateTag={handleCreateTag}
      />

      {/* Create Dialog */}
      <LoreNoteFormDialog
        isOpen={isCreateDialogOpen}
        mode="create"
        campaignId={campaignId}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
}
