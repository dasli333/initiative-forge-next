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

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filters for querying Factions
 * Empty in MVP - prepared for future filtering features
 */
export interface FactionFilters {
  search?: string; // Future: search by name
}

// ============================================================================
// VIEW MODELS
// ============================================================================

/**
 * Enriched faction for list items
 */
export interface FactionCardViewModel {
  faction: FactionDTO;
  memberCount: number; // Count of NPCs with faction_id === this.id
  relationshipCounts: {
    alliance: number;
    war: number;
    rivalry: number;
    neutral: number;
  };
}

/**
 * Full faction details for detail panel
 */
export interface FactionDetailsViewModel {
  faction: FactionDTO;
  members: import('@/types/npcs').NPCDTO[]; // NPCs in this faction
  relationships: FactionRelationshipViewModel[];
  backlinks: BacklinkItem[];
}

/**
 * Faction relationship with joined data for display
 */
export interface FactionRelationshipViewModel {
  id: string;
  faction_id_1: string;
  faction_id_2: string;
  relationship_type: 'alliance' | 'war' | 'rivalry' | 'neutral';
  description: string | null;
  other_faction_id: string; // The other faction's ID (not current)
  other_faction_name: string;
  other_faction_image_url: string | null;
}

/**
 * Backlink item from entity mentions
 */
export interface BacklinkItem {
  source_type: 'npc' | 'quest' | 'session' | 'location' | 'faction' | 'story_arc' | 'lore_note' | 'story_item' | 'player_character';
  source_id: string;
  source_name: string;
  source_field: string;
}
