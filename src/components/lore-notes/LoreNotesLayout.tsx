'use client';

import { SplitLayout } from '@/components/shared/SplitLayout';
import { LoreNotesList } from './LoreNotesList';
import { LoreNoteDetailPanel } from './LoreNoteDetailPanel';
import type { LoreNoteDTO, LoreNoteFilters, LoreNoteCategory } from '@/types/lore-notes';
import type { JSONContent } from '@tiptap/react';

interface LoreNotesLayoutProps {
  // List props
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
    tags: string[];
  } | null;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditedDataChange: (field: string, value: unknown) => void;
  campaignId: string;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

/**
 * Split view layout: 30% list | 70% detail panel
 */
export function LoreNotesLayout({
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
  campaignId,
  isUpdating,
  isDeleting,
}: LoreNotesLayoutProps) {
  return (
    <SplitLayout
      leftPanel={
        <LoreNotesList
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
        />
      }
    />
  );
}
