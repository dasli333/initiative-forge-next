'use client';

import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { SectionCard } from '../shared/SectionCard';
import type { JSONContent } from '@tiptap/react';

interface SummarySectionProps {
  summary: JSONContent | null;
  isEditing: boolean;
  onChange: (summary: JSONContent | null) => void;
  campaignId: string;
}

export function SummarySection({ summary, isEditing, onChange, campaignId }: SummarySectionProps) {
  return (
    <SectionCard
      title="Session Summary"
      description="What happened during this session"
    >
      <div className="min-h-[150px]">
        <RichTextEditor
          value={summary}
          onChange={onChange}
          readonly={!isEditing}
          campaignId={campaignId}
          placeholder="The party ventured into the caves and discovered..."
          className={!isEditing ? 'border-transparent bg-transparent' : ''}
        />
      </div>
    </SectionCard>
  );
}
