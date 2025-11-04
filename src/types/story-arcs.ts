import type { Json, Tables } from '@/types/database';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type StoryArc = Tables<'story_arcs'>;

// ============================================================================
// COMMAND MODELS
// ============================================================================

/**
 * Create story arc command
 * campaign_id is passed separately in API function
 */
export interface CreateStoryArcCommand {
  title: string;
  description_json?: Json | null; // Rich text with @mentions
  status?: 'planning' | 'active' | 'completed' | 'abandoned';
  start_date?: string | null; // In-game fantasy calendar date
  end_date?: string | null;
}

/**
 * Update story arc command
 * All fields are optional for partial updates
 */
export interface UpdateStoryArcCommand {
  title?: string;
  description_json?: Json | null;
  status?: 'planning' | 'active' | 'completed' | 'abandoned';
  start_date?: string | null;
  end_date?: string | null;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filters for querying story arcs
 */
export interface StoryArcFilters {
  status?: 'planning' | 'active' | 'completed' | 'abandoned';
}
