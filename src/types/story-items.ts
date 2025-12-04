import type { Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';

export type StoryItem = Tables<'story_items'>;

/**
 * Ownership history entry structure
 */
export interface OwnershipHistoryEntry {
  owner_type: 'npc' | 'player_character' | 'faction' | 'location';
  owner_id: string;
  owner_name?: string;
  from: string; // Fantasy calendar text (e.g., "1370 DR, Mirtul 15")
  to: string | null; // Fantasy calendar text or null if current owner
  sort_order: number; // For chronological sorting (0, 1, 2, ...)
  notes?: string;
}

/**
 * Story Item DTO with typed Json fields
 */
export interface StoryItemDTO extends Omit<StoryItem, 'description_json' | 'ownership_history_json'> {
  description_json: JSONContent | null;
  ownership_history_json: OwnershipHistoryEntry[] | null;
  current_owner_name?: string | null; // Enriched from owner table based on current_owner_type/id
}

export interface CreateStoryItemCommand {
  name: string;
  description_json?: JSONContent | null;
  image_url?: string | null;
  ownership_history_json?: OwnershipHistoryEntry[] | null;
}

export interface UpdateStoryItemCommand {
  name?: string;
  description_json?: JSONContent | null;
  image_url?: string | null;
  ownership_history_json?: OwnershipHistoryEntry[] | null;
}

export interface StoryItemFilters {
  current_owner_type?: string;
  current_owner_id?: string;
}
