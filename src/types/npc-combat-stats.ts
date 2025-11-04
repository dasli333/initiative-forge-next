import type { Tables } from '@/types/database';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type NPCCombatStats = Tables<'npc_combat_stats'>;

// ============================================================================
// COMMAND MODELS
// ============================================================================

/**
 * Upsert NPC combat stats command
 * npc_id is the PK and passed separately in API function
 */
export interface UpsertNPCCombatStatsCommand {
  hp_max: number;
  armor_class: number;
  speed: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  actions_json?: any; // Array of actions (same format as player_characters.actions)
}
