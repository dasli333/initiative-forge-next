'use client';

import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { SectionCard } from '../shared/SectionCard';
import type { JSONContent } from '@tiptap/react';
import type { SessionStatus } from '@/types/sessions';

interface OpeningSectionProps {
  opening: JSONContent | null;
  isEditing: boolean;
  onChange: (opening: JSONContent | null) => void;
  campaignId: string;
  status: SessionStatus;
}

export function OpeningSection({ opening, isEditing, onChange, campaignId, status }: OpeningSectionProps) {
  const defaultCollapsed = status === 'in_progress' || status === 'completed';

  return (
    <SectionCard
      title="Session Opening"
      description='"Previously on..." text to read or present to players'
      collapsible
      defaultCollapsed={defaultCollapsed}
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
