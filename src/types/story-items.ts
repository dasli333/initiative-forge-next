import type { Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';

export type StoryItem = Tables<'story_items'>;

/**
 * Ownership history entry structure
 */
export interface OwnershipHistoryEntry {
  owner_type: string;
  owner_id: string;
  owner_name?: string;
  from: string; // ISO date when ownership started
  to: string | null; // ISO date when ownership ended, null if current
  notes?: string;
}

/**
 * Story Item DTO with typed Json fields
 */
export interface StoryItemDTO extends Omit<StoryItem, 'description_json' | 'ownership_history_json'> {
  description_json: JSONContent | null;
  ownership_history_json: OwnershipHistoryEntry[] | null;
}

export interface CreateStoryItemCommand {
  name: string;
  description_json?: JSONContent | null;
  image_url?: string | null;
  current_owner_type?: string | null;
  current_owner_id?: string | null;
  ownership_history_json?: OwnershipHistoryEntry[] | null;
}

export interface UpdateStoryItemCommand {
  name?: string;
  description_json?: JSONContent | null;
  image_url?: string | null;
  current_owner_type?: string | null;
  current_owner_id?: string | null;
}

export interface StoryItemFilters {
  current_owner_type?: string;
  current_owner_id?: string;
}
