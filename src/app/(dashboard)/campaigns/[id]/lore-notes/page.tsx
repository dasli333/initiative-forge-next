'use client';

import { useState, useCallback } from 'react';
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
import type { LoreNoteFilters, LoreNoteCategory } from '@/types/lore-notes';
import type { LoreNoteFormData } from '@/lib/schemas/lore-notes';
import type { JSONContent } from '@tiptap/react';

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
    tags: string[];
  } | null>(null);

  // Queries
  const { data: notes = [], isLoading: notesLoading } = useLoreNotesQuery(campaignId, filters);
  const { data: noteDetails, isLoading: detailsLoading } = useLoreNoteQuery(selectedNoteId || undefined);

  // Mutations
  const createMutation = useCreateLoreNoteMutation(campaignId);
  const updateMutation = useUpdateLoreNoteMutation(campaignId);
  const deleteMutation = useDeleteLoreNoteMutation(campaignId);

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
        tags: noteDetails.tags,
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
          tags: editedData.tags,
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
          tags: data.tags || [],
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
        notes={notes}
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
