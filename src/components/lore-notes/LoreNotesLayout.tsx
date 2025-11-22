'use client';

import { SplitLayout } from '@/components/shared/SplitLayout';
import { LoreNotesList } from './LoreNotesList';
import { LoreNoteDetailPanel } from './LoreNoteDetailPanel';
import type { LoreNoteDTO, LoreNoteFilters, LoreNoteCategory } from '@/types/lore-notes';
import type { LoreNoteTagDTO, TagIcon } from '@/types/lore-note-tags';
import type { JSONContent } from '@tiptap/react';

interface LoreNotesLayoutProps {
  // List props
  campaignId: string;
  notes: LoreNoteDTO[];
  selectedNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  onCreateNote: () => void;
  filters: LoreNoteFilters;
  onFiltersChange: (filters: LoreNoteFilters) => void;
  isLoading: boolean;

  // Detail panel props
  selectedNote: LoreNoteDTO | undefined;
  isDetailLoading: boolean;
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

  // Tag props
  availableTags: LoreNoteTagDTO[];
  assignedTags: LoreNoteTagDTO[];
  onAssignTag: (tagId: string) => Promise<void>;
  onUnassignTag: (tagId: string) => Promise<void>;
  onCreateTag: (name: string, color: string, icon: TagIcon) => Promise<LoreNoteTagDTO>;
}

/**
 * Split view layout: 30% list | 70% detail panel
 */
export function LoreNotesLayout({
  campaignId,
  notes,
  selectedNoteId,
  onNoteSelect,
  onCreateNote,
  filters,
  onFiltersChange,
  isLoading,
  selectedNote,
  isDetailLoading,
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
}: LoreNotesLayoutProps) {
  return (
    <SplitLayout
      leftPanel={
        <LoreNotesList
          campaignId={campaignId}
          notes={notes}
          selectedNoteId={selectedNoteId}
          onNoteSelect={onNoteSelect}
          onCreateNote={onCreateNote}
          filters={filters}
          onFiltersChange={onFiltersChange}
          isLoading={isLoading}
        />
      }
      rightPanel={
        <LoreNoteDetailPanel
          noteId={selectedNoteId}
          note={selectedNote}
          campaignId={campaignId}
          isLoading={isDetailLoading}
          isEditing={isEditing}
          editedData={editedData}
          onEdit={onEdit}
          onSave={onSave}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
          onEditedDataChange={onEditedDataChange}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          availableTags={availableTags}
          assignedTags={assignedTags}
          onAssignTag={onAssignTag}
          onUnassignTag={onUnassignTag}
          onCreateTag={onCreateTag}
        />
      }
    />
  );
}
