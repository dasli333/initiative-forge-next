import type { Tables } from '@/types/database';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type Quest = Tables<'quests'>;

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
  description_json?: any; // Rich text with @mentions
  objectives_json?: any; // List of objectives
  rewards_json?: any; // Structured rewards: {gold, items, xp, other}
  status?: 'not_started' | 'active' | 'completed' | 'failed';
}

/**
 * Update quest command
 * All fields are optional for partial updates
 */
export interface UpdateQuestCommand {
  story_arc_id?: string | null;
  title?: string;
  description_json?: any;
  objectives_json?: any;
  rewards_json?: any;
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
