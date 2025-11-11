import type { Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';
import type { ActionDTO } from '@/types';

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Player Character Status
 */
export type PlayerCharacterStatus = 'active' | 'retired' | 'deceased';

export type PlayerCharacter = Tables<'player_characters'>;

/**
 * Player Character DTO with typed Json fields
 */
export interface PlayerCharacterDTO extends Omit<PlayerCharacter, 'biography_json' | 'personality_json' | 'notes'> {
  biography_json: JSONContent | null;
  personality_json: JSONContent | null;
  notes: JSONContent | null;
}

/**
 * Player Character Combat Stats DTO
 * Separated table for optional combat statistics
 */
export interface PlayerCharacterCombatStatsDTO {
  player_character_id: string;
  hp_max: number;
  armor_class: number;
  speed: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  actions_json: ActionDTO[] | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// COMMAND MODELS
// ============================================================================

/**
 * Create Player Character command
 * campaign_id is passed separately in API function
 */
export interface CreatePlayerCharacterCommand {
  name: string;
  class?: string | null;
  level?: number | null;
  race?: string | null;
  background?: string | null;
  alignment?: 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null;
  age?: number | null;
  languages?: string[] | null;
  faction_id?: string | null;
  image_url?: string | null;
  biography_json?: JSONContent | null; // Rich text with @mentions
  personality_json?: JSONContent | null; // Rich text with @mentions
  notes?: JSONContent | null; // DM-only rich text notes with @mentions
  status?: PlayerCharacterStatus;
}

/**
 * Update Player Character command
 * All fields are optional for partial updates
 */
export interface UpdatePlayerCharacterCommand {
  name?: string;
  class?: string | null;
  level?: number | null;
  race?: string | null;
  background?: string | null;
  alignment?: 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null;
  age?: number | null;
  languages?: string[] | null;
  faction_id?: string | null;
  image_url?: string | null;
  biography_json?: JSONContent | null;
  personality_json?: JSONContent | null;
  notes?: JSONContent | null; // DM-only rich text notes with @mentions
  status?: PlayerCharacterStatus;
}

/**
 * Create/Update Combat Stats command
 */
export interface CreateCombatStatsCommand {
  hp_max: number;
  armor_class: number;
  speed: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  actions_json?: ActionDTO[] | null;
}

export interface UpdateCombatStatsCommand {
  hp_max?: number;
  armor_class?: number;
  speed?: number;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  actions_json?: ActionDTO[] | null;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filters for querying Player Characters
 */
export interface PlayerCharacterFilters {
  faction_id?: string | null; // null = "no faction"
  status?: PlayerCharacterStatus;
  class?: string; // Free text search in class field
  search?: string; // Search by name/class
}

// ============================================================================
// VIEW MODELS
// ============================================================================

/**
 * Enriched Player Character for list items
 */
export interface PlayerCharacterCardViewModel {
  id: string;
  name: string;
  class: string | null;
  level: number | null;
  image_url: string | null;
  faction_id: string | null;
  faction_name: string | null; // From JOIN
  status: PlayerCharacterStatus;
  hp_max: number | null; // From combat_stats
  armor_class: number | null; // From combat_stats
}

/**
 * Full Player Character details for detail panel
 */
export interface PlayerCharacterDetailsViewModel {
  id: string;
  campaign_id: string;
  name: string;
  class: string | null;
  level: number | null;
  race: string | null;
  background: string | null;
  alignment: 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null;
  age: number | null;
  languages: string[] | null;
  faction_id: string | null;
  faction_name: string | null; // From JOIN
  image_url: string | null;
  biography_json: JSONContent | null;
  personality_json: JSONContent | null;
  notes: JSONContent | null; // DM-only rich text notes with @mentions
  status: PlayerCharacterStatus;
  combat_stats: PlayerCharacterCombatStatsDTO | null;
  relationships: PCNPCRelationshipViewModel[];
  created_at: string;
  updated_at: string;
}

/**
 * PC-NPC Relationship DTO
 */
export interface PCNPCRelationshipDTO {
  id: string;
  player_character_id: string;
  npc_id: string;
  relationship_type: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * PC-NPC Relationship with enriched NPC data
 */
export interface PCNPCRelationshipViewModel {
  id: string;
  npc_id: string;
  npc_name: string;
  npc_image_url: string | null;
  relationship_type: string;
  description: string | null;
}

/**
 * Create PC-NPC Relationship command
 */
export interface CreatePCNPCRelationshipCommand {
  npc_id: string;
  relationship_type: string; // Free text: mentor, ally, rival, father, etc.
  description?: string | null;
}

/**
 * Update PC-NPC Relationship command
 */
export interface UpdatePCNPCRelationshipCommand {
  relationship_type?: string;
  description?: string | null;
}

/**
 * Backlink item (entity mentioning this PC)
 */
export interface BacklinkItem {
  source_type: 'npc' | 'quest' | 'session' | 'location' | 'faction' | 'story_arc' | 'lore_note' | 'story_item' | 'player_character';
  source_id: string;
  source_name: string;
  source_field: string;
}
