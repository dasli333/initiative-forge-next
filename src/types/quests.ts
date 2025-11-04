import type { Json, Tables } from '@/types/database';

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
  description_json?: Json | null; // Rich text with @mentions
  objectives_json?: Json | null; // List of objectives
  rewards_json?: Json | null; // Structured rewards: {gold, items, xp, other}
  status?: 'not_started' | 'active' | 'completed' | 'failed';
}

/**
 * Update quest command
 * All fields are optional for partial updates
 */
export interface UpdateQuestCommand {
  story_arc_id?: string | null;
  title?: string;
  description_json?: Json | null;
  objectives_json?: Json | null;
  rewards_json?: Json | null;
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
