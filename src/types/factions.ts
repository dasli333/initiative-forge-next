import type { Json, Tables } from '@/types/database';

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
  description_json?: Json | null; // Rich text with @mentions
  goals_json?: Json | null; // Rich text
  resources_json?: Json | null; // Future use
  image_url?: string | null;
}

/**
 * Update faction command
 * All fields are optional for partial updates
 */
export interface UpdateFactionCommand {
  name?: string;
  description_json?: Json | null;
  goals_json?: Json | null;
  resources_json?: Json | null;
  image_url?: string | null;
}
