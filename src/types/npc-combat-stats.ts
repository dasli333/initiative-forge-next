import type { Tables } from '@/types/database';
import type { ActionDTO } from '@/types';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type NPCCombatStats = Tables<'npc_combat_stats'>;

/**
 * NPC Combat Stats DTO with typed Json fields
 */
export interface NPCCombatStatsDTO extends Omit<NPCCombatStats, 'actions_json'> {
  actions_json: ActionDTO[] | null;
}

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
  actions_json?: ActionDTO[] | null; // Array of actions (same format as player_characters.actions)
}
