import type { Json, Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type NPC = Tables<'npcs'>;

/**
 * NPC DTO with typed Json fields
 */
export interface NPCSDTO extends Omit<NPC, 'biography_json' | 'personality_json'> {
  biography_json: JSONContent | null;
  personality_json: JSONContent | null;
}

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
  biography_json?: JSONContent | null; // Rich text with @mentions
  personality_json?: JSONContent | null; // Rich text
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
  biography_json?: JSONContent | null;
  personality_json?: JSONContent | null;
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
