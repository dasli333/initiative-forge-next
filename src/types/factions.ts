import type { Tables } from '@/types/database';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type Faction = Tables<'factions'>;

// ============================================================================
// COMMAND MODELS
// ============================================================================

/**
 * Create faction command
 * campaign_id is passed separately in API function
 */
export interface CreateFactionCommand {
  name: string;
  description_json?: any; // Rich text with @mentions
  goals_json?: any; // Rich text
  resources_json?: any; // Future use
  image_url?: string | null;
}

/**
 * Update faction command
 * All fields are optional for partial updates
 */
export interface UpdateFactionCommand {
  name?: string;
  description_json?: any;
  goals_json?: any;
  resources_json?: any;
  image_url?: string | null;
}
