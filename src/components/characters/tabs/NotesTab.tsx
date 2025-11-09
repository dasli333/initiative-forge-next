'use client';

import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface NotesTabProps {
  isEditing: boolean;
  notes: string | null;
  editedNotes: string | null;
  onNotesChange: (notes: string) => void;
}

/**
 * Notes tab component for Player Character details
 * - GM-only private notes field
 * - Large textarea (simple text, not rich text)
 * - Auto-resizing textarea
 */
export function NotesTab({
  isEditing,
  notes,
  editedNotes,
  onNotesChange,
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

      {/* Notes Textarea */}
      {isEditing ? (
        <Textarea
          value={displayNotes || ''}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add private notes about this character..."
          className="min-h-[400px] resize-y"
        />
      ) : (
        <div className="min-h-[200px] p-4 rounded-lg border bg-muted/30">
          {displayNotes ? (
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">
              {displayNotes}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No notes yet. Click Edit to add private DM notes.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
