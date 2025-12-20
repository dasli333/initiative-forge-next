'use client';

import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { SectionCard } from '../shared/SectionCard';
import type { JSONContent } from '@tiptap/react';

interface OpeningSectionProps {
  opening: JSONContent | null;
  isEditing: boolean;
  onChange: (opening: JSONContent | null) => void;
  campaignId: string;
}

export function OpeningSection({ opening, isEditing, onChange, campaignId }: OpeningSectionProps) {
  return (
    <SectionCard
      title="Session Opening"
      description='"Previously on..." text to read or present to players'
    >
      <div className="min-h-[120px]">
        <RichTextEditor
          value={opening}
          onChange={onChange}
          readonly={!isEditing}
          campaignId={campaignId}
          placeholder="Last time, the party arrived at the gates of..."
          className={!isEditing ? 'border-transparent bg-transparent' : ''}
        />
      </div>
    </SectionCard>
  );
}
