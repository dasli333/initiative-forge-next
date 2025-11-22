import type { JSONContent } from '@tiptap/core';

/**
 * Related Entity extracted from timeline event's related_entities_json
 */
export interface RelatedEntity {
    type: 'npc' | 'location' | 'quest' | 'faction' | 'item' | 'arc';
    id: string;
    name: string;
}

/**
 * Form data for creating/editing timeline event (React Hook Form)
 */
export interface TimelineEventFormData {
    title: string;
    event_date: string; // fantasy calendar free text
    sort_date: Date; // Date object for picker
    description_json?: JSONContent | null; // Tiptap JSON
}
