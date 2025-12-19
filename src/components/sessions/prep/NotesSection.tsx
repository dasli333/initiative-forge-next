'use client';

import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { Label } from '@/components/ui/label';
import type { JSONContent } from '@tiptap/react';

interface NotesSectionProps {
  notes: JSONContent | null;
  isEditing: boolean;
  onChange: (notes: JSONContent | null) => void;
  campaignId: string;
}

export function NotesSection({ notes, isEditing, onChange, campaignId }: NotesSectionProps) {
  return (
    <section className="space-y-2">
      <Label className="text-base font-semibold">Notes</Label>
      <p className="text-xs text-muted-foreground">
        Additional notes, reminders, and ideas for the session
      </p>
      <div className="min-h-[100px]">
        <RichTextEditor
          value={notes}
          onChange={onChange}
          readonly={!isEditing}
          campaignId={campaignId}
          placeholder="Remember to prepare battle music..."
          className={!isEditing ? 'border-transparent bg-transparent' : ''}
        />
      </div>
    </section>
  );
}
