import type { Tables } from '@/types/database';
import type { MonsterAction, MonsterTrait, LegendaryActions } from '@/lib/schemas/monster.schema';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type NPCCombatStats = Tables<'npc_combat_stats'>;

/**
 * NPC Combat Stats DTO with typed Json fields
 */
export interface NPCCombatStatsDTO extends Omit<NPCCombatStats,
  'actions_json' | 'traits_json' | 'bonus_actions_json' | 'reactions_json' | 'legendary_actions_json' | 'speed'> {
  speed: string[] | null;
  actions_json: MonsterAction[] | null;
  traits_json: MonsterTrait[] | null;
  bonus_actions_json: MonsterAction[] | null;
  reactions_json: MonsterAction[] | null;
  legendary_actions_json: LegendaryActions | null;
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
  speed: string[];
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  // Ability types
  actions_json?: MonsterAction[] | null;
  traits_json?: MonsterTrait[] | null;
  bonus_actions_json?: MonsterAction[] | null;
  reactions_json?: MonsterAction[] | null;
  legendary_actions_json?: LegendaryActions | null;
  // Combat properties
  damage_vulnerabilities?: string[] | null;
  damage_resistances?: string[] | null;
  damage_immunities?: string[] | null;
  condition_immunities?: string[] | null;
  gear?: string[] | null;
}
