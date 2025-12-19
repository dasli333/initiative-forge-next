'use client';

import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { Label } from '@/components/ui/label';
import type { JSONContent } from '@tiptap/react';

interface SummarySectionProps {
  summary: JSONContent | null;
  isEditing: boolean;
  onChange: (summary: JSONContent | null) => void;
  campaignId: string;
}

export function SummarySection({ summary, isEditing, onChange, campaignId }: SummarySectionProps) {
  return (
    <section className="space-y-2">
      <Label className="text-base font-semibold">Session Summary</Label>
      <p className="text-xs text-muted-foreground">
        What happened during this session
      </p>
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
    </section>
  );
}
