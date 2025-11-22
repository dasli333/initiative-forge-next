import { z } from 'zod';
import { JSONContent } from '@tiptap/react';

export const createTimelineEventSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    event_date: z.string().min(1, 'In-game date is required'),
    sort_date: z.date(),
    description_json: z.custom<JSONContent>().nullable().optional(),
    source_type: z.string().nullable().optional(),
    source_id: z.string().nullable().optional(),
});
