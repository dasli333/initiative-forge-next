import { Tables } from '@/types/database';
import { JSONContent } from '@tiptap/react';

export type TimelineEvent = Tables<'timeline_events'>;

export interface TimelineEventDTO {
  id: string;
  campaign_id: string;
  title: string;
  description_json: JSONContent | null;
  event_date: string;
  sort_date: string;
  source_type: string | null;
  source_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTimelineEventCommand {
  title: string;
  description_json?: JSONContent | null;
  event_date: string; // In-game fantasy calendar (display)
  sort_date: string; // YYYY-MM-DD (for sorting)
  source_type?: string | null;
  source_id?: string | null;
}

export interface UpdateTimelineEventCommand {
  title?: string;
  description_json?: JSONContent | null;
  event_date?: string;
  sort_date?: string;
  source_type?: string | null;
  source_id?: string | null;
}

export interface TimelineEventFilters {
  source_type?: string;
  source_id?: string;
}
