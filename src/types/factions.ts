import type { Json, Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type Faction = Tables<'factions'>;

/**
 * Faction DTO with typed Json fields
 */
export interface FactionDTO extends Omit<Faction, 'description_json' | 'goals_json' | 'resources_json'> {
  description_json: JSONContent | null;
  goals_json: JSONContent | null;
  resources_json: Json | null; // Future use - keep as Json
}

// ============================================================================
// COMMAND MODELS
// ============================================================================

/**
 * Create faction command
 * campaign_id is passed separately in API function
 */
export interface CreateFactionCommand {
  name: string;
  description_json?: JSONContent | null; // Rich text with @mentions
  goals_json?: JSONContent | null; // Rich text
  resources_json?: Json | null; // Future use
  image_url?: string | null;
}

/**
 * Update faction command
 * All fields are optional for partial updates
 */
export interface UpdateFactionCommand {
  name?: string;
  description_json?: JSONContent | null;
  goals_json?: JSONContent | null;
  resources_json?: Json | null;
  image_url?: string | null;
}
