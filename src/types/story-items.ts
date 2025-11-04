import type { Json, Tables } from '@/types/database';

export type StoryItem = Tables<'story_items'>;

export interface CreateStoryItemCommand {
  name: string;
  description_json?: Json | null;
  image_url?: string | null;
  current_owner_type?: string | null;
  current_owner_id?: string | null;
  ownership_history_json?: Json | null;
}

export interface UpdateStoryItemCommand {
  name?: string;
  description_json?: Json | null;
  image_url?: string | null;
  current_owner_type?: string | null;
  current_owner_id?: string | null;
}

export interface StoryItemFilters {
  current_owner_type?: string;
  current_owner_id?: string;
}
