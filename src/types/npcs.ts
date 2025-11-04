import type { Json, Tables } from '@/types/database';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type NPC = Tables<'npcs'>;

// ============================================================================
// COMMAND MODELS
// ============================================================================

/**
 * Create NPC command
 * campaign_id is passed separately in API function
 */
export interface CreateNPCCommand {
  name: string;
  role?: string | null;
  biography_json?: Json | null; // Rich text with @mentions
  personality_json?: Json | null; // Rich text
  image_url?: string | null;
  faction_id?: string | null;
  current_location_id?: string | null;
  status?: 'alive' | 'dead' | 'unknown';
}

/**
 * Update NPC command
 * All fields are optional for partial updates
 */
export interface UpdateNPCCommand {
  name?: string;
  role?: string | null;
  biography_json?: Json | null;
  personality_json?: Json | null;
  image_url?: string | null;
  faction_id?: string | null;
  current_location_id?: string | null;
  status?: 'alive' | 'dead' | 'unknown';
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filters for querying NPCs
 */
export interface NPCFilters {
  faction_id?: string | null;
  current_location_id?: string | null;
  status?: 'alive' | 'dead' | 'unknown';
}
