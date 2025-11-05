import type { Json, Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type Quest = Tables<'quests'>;

/**
 * Quest objective structure
 */
export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
}

/**
 * Quest rewards structure
 */
export interface QuestRewards {
  gold?: number;
  items?: string[];
  xp?: number;
  other?: string;
}

/**
 * Quest DTO with typed Json fields
 */
export interface QuestDTO extends Omit<Quest, 'description_json' | 'objectives_json' | 'rewards_json'> {
  description_json: JSONContent | null;
  objectives_json: QuestObjective[] | null;
  rewards_json: QuestRewards | null;
}

// ============================================================================
// COMMAND MODELS
// ============================================================================

/**
 * Create quest command
 * campaign_id is passed separately in API function
 */
export interface CreateQuestCommand {
  story_arc_id?: string | null;
  title: string;
  description_json?: JSONContent | null; // Rich text with @mentions
  objectives_json?: QuestObjective[] | null; // List of objectives
  rewards_json?: QuestRewards | null; // Structured rewards: {gold, items, xp, other}
  status?: 'not_started' | 'active' | 'completed' | 'failed';
}

/**
 * Update quest command
 * All fields are optional for partial updates
 */
export interface UpdateQuestCommand {
  story_arc_id?: string | null;
  title?: string;
  description_json?: JSONContent | null;
  objectives_json?: QuestObjective[] | null;
  rewards_json?: QuestRewards | null;
  status?: 'not_started' | 'active' | 'completed' | 'failed';
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filters for querying quests
 */
export interface QuestFilters {
  story_arc_id?: string | null;
  status?: 'not_started' | 'active' | 'completed' | 'failed';
}
