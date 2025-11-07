import type { Json, Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type NPC = Tables<'npcs'>;

/**
 * NPC DTO with typed Json fields
 */
export interface NPCDTO extends Omit<NPC, 'biography_json' | 'personality_json'> {
  biography_json: JSONContent | null;
  personality_json: JSONContent | null;
}

// Legacy alias (deprecated, use NPCDTO)
export type NPCSDTO = NPCDTO;

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

// ============================================================================
// VIEW MODELS
// ============================================================================

/**
 * Enriched NPC for grid cards
 */
export interface NPCCardViewModel {
  npc: NPCDTO;
  hasCombatStats: boolean;
  factionName?: string;
  locationName?: string;
}

/**
 * Full NPC details for slideover
 */
export interface NPCDetailsViewModel {
  npc: NPCDTO;
  combatStats: import('@/types/npc-combat-stats').NPCCombatStatsDTO | null;
  relationships: NPCRelationshipViewModel[];
  backlinks: BacklinkItem[];
  factionName?: string;
  locationName?: string;
}

/**
 * Relationship with enriched NPC data
 */
export interface NPCRelationshipViewModel {
  relationship: import('@/types/npc-relationships').NPCRelationship;
  otherNpcName: string;
  otherNpcImageUrl?: string;
}

/**
 * Backlink item (entity mentioning this NPC)
 */
export interface BacklinkItem {
  source_type: 'npc' | 'quest' | 'session' | 'location' | 'faction' | 'story_arc' | 'lore_note' | 'story_item';
  source_id: string;
  source_name: string;
  source_field: string;
}
