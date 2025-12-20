'use client';

import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { SectionCard } from '../shared/SectionCard';
import type { JSONContent } from '@tiptap/react';

interface NotesSectionProps {
  notes: JSONContent | null;
  isEditing: boolean;
  onChange: (notes: JSONContent | null) => void;
  campaignId: string;
}

export function NotesSection({ notes, isEditing, onChange, campaignId }: NotesSectionProps) {
  return (
    <SectionCard
      title="Notes"
      description="Additional notes, reminders, and ideas for the session"
    >
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
    </SectionCard>
  );
}
