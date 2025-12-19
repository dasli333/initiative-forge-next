'use client';

import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { Label } from '@/components/ui/label';
import type { JSONContent } from '@tiptap/react';

interface OpeningSectionProps {
  opening: JSONContent | null;
  isEditing: boolean;
  onChange: (opening: JSONContent | null) => void;
  campaignId: string;
}

export function OpeningSection({ opening, isEditing, onChange, campaignId }: OpeningSectionProps) {
  return (
    <section className="space-y-2">
      <Label className="text-base font-semibold">Session Opening</Label>
      <p className="text-xs text-muted-foreground">
        &quot;Previously on...&quot; text to read or present to players
      </p>
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
    </section>
  );
}
