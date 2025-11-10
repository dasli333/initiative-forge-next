'use client';

import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { FileText } from 'lucide-react';
import type { JSONContent } from '@tiptap/core';

interface NotesTabProps {
  isEditing: boolean;
  notes: JSONContent | null;
  editedNotes: JSONContent | null;
  onNotesChange: (notes: JSONContent | null) => void;
  campaignId: string;
}

/**
 * Notes tab component for Player Character details
 * - GM-only private notes field
 * - Rich text editor with @mentions support
 */
export function NotesTab({
  isEditing,
  notes,
  editedNotes,
  onNotesChange,
  campaignId,
}: NotesTabProps) {
  const displayNotes = isEditing ? editedNotes : notes;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50 dark:bg-amber-950/20 rounded">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Private DM Notes
          </h3>
        </div>
        <p className="text-xs text-amber-800 dark:text-amber-200">
          These notes are for your eyes only and will not be shared with players. Use this space to track
          plot hooks, secret motivations, campaign connections, or any other information you want to remember.
        </p>
      </div>

      {/* Notes Editor */}
      <RichTextEditor
        value={displayNotes}
        onChange={(content) => isEditing && onNotesChange(content)}
        campaignId={campaignId}
        placeholder="Add private notes about this character..."
        readonly={!isEditing}
        className="min-h-[400px]"
      />
    </div>
  );
}
