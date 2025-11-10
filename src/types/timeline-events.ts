import type { Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';

export type TimelineEvent = Tables<'timeline_events'>;

/**
 * Related entity reference structure
 */
export interface RelatedEntity {
  entity_type: string;
  entity_id: string;
}

/**
 * Timeline Event DTO with typed Json fields
 */
export interface TimelineEventDTO extends Omit<TimelineEvent, 'description_json' | 'related_entities_json'> {
  description_json: JSONContent | null;
  related_entities_json: RelatedEntity[] | null;
}

export interface CreateTimelineEventCommand {
  title: string;
  description_json?: JSONContent | null;
  event_date: string; // In-game fantasy calendar
  real_date?: string | null; // YYYY-MM-DD
  related_entities_json?: RelatedEntity[] | null;
  source_type?: string | null;
  source_id?: string | null;
}

export interface UpdateTimelineEventCommand {
  title?: string;
  description_json?: JSONContent | null;
  event_date?: string;
  real_date?: string | null;
  related_entities_json?: RelatedEntity[] | null;
  source_type?: string | null;
  source_id?: string | null;
}

export interface TimelineEventFilters {
  source_type?: string;
  source_id?: string;
}
