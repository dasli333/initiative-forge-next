import type { Json, Tables } from '@/types/database';

export type TimelineEvent = Tables<'timeline_events'>;

export interface CreateTimelineEventCommand {
  title: string;
  description_json?: Json | null;
  event_date: string; // In-game fantasy calendar
  real_date?: string | null; // YYYY-MM-DD
  related_entities_json?: Json | null;
  source_type?: string | null;
  source_id?: string | null;
}

export interface UpdateTimelineEventCommand {
  title?: string;
  description_json?: Json | null;
  event_date?: string;
  real_date?: string | null;
  related_entities_json?: Json | null;
  source_type?: string | null;
  source_id?: string | null;
}

export interface TimelineEventFilters {
  source_type?: string;
  source_id?: string;
}
