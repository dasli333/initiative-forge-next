import type { Json, Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';
import type { NPCTagDTO } from '@/types/npc-tags';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type NPC = Tables<'npcs'>;

/**
 * NPC DTO with typed Json fields
 */
export interface NPCDTO extends Omit<NPC, 'biography_json' | 'personality_json' | 'secrets'> {
  biography_json: JSONContent | null;
  personality_json: JSONContent | null;
  secrets: JSONContent | null;
}

// Legacy alias (deprecated, use NPCDTO)
export type NPCSDTO = NPCDTO;

/**
 * Enriched NPC with joined data from Supabase query
 * Used internally in API layer before flattening to NPCDTO
 */
export interface NPCWithJoins extends NPCDTO {
  factions?: { name: string } | null;
  locations?: { name: string } | null;
  npc_tag_assignments?: Array<{
    npc_tags: NPCTagDTO | null;
  }> | null;
  npc_combat_stats?: unknown | null;
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
  // Character sheet fields
  race?: string | null;
  age?: number | null;
  alignment?: 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null;
  languages?: string[] | null;
  distinguishing_features?: string | null;
  secrets?: JSONContent | null; // Rich text with @mentions
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
  // Character sheet fields
  race?: string | null;
  age?: number | null;
  alignment?: 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null;
  languages?: string[] | null;
  distinguishing_features?: string | null;
  secrets?: JSONContent | null; // Rich text with @mentions
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
  tag_ids?: string[]; // Filter by multiple tags (OR logic)
  search?: string; // Search by name/role
}

// ============================================================================
// VIEW MODELS
// ============================================================================

/**
 * Enriched NPC for list items
 */
export interface NPCCardViewModel {
  npc: NPCDTO;
  hasCombatStats: boolean;
  factionName?: string;
  locationName?: string;
  tags: NPCTagDTO[]; // Assigned tags for this NPC
}

/**
 * Full NPC details for detail panel
 */
export interface NPCDetailsViewModel {
  npc: NPCDTO;
  combatStats: import('@/types/npc-combat-stats').NPCCombatStatsDTO | null;
  relationships: NPCRelationshipViewModel[];
  pcRelationships: PCRelationshipViewModel[]; // Player characters related to this NPC
  backlinks: BacklinkItem[];
  factionName?: string;
  locationName?: string;
  tags: NPCTagDTO[]; // Assigned tags for this NPC
}

/**
 * PC relationship with joined data from Supabase query
 * Used internally in API layer before mapping to PCRelationshipViewModel
 */
export interface PCRelationshipWithJoins {
  id: string;
  player_character_id: string;
  relationship_type: string;
  description: string | null;
  player_characters?: {
    name: string;
    image_url: string | null;
  } | null;
}

/**
 * PC relationship (player character → this NPC)
 */
export interface PCRelationshipViewModel {
  id: string;
  player_character_id: string;
  player_character_name: string;
  player_character_image_url: string | null;
  relationship_type: string;
  description: string | null;
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
