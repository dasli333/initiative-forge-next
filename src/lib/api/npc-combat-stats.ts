import { getSupabaseClient } from '@/lib/supabase';
import type { NPCCombatStatsDTO, UpsertNPCCombatStatsCommand } from '@/types/npc-combat-stats';
import type { Json } from '@/types/database';

/**
 * Get NPC combat stats for a specific NPC
 * Returns null if no combat stats exist (optional 1:1 relationship)
 */
export async function getNPCCombatStats(npcId: string): Promise<NPCCombatStatsDTO | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('npc_combat_stats')
    .select('*')
    .eq('npc_id', npcId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch NPC combat stats:', error);
    throw new Error(error.message);
  }

  return data as unknown as NPCCombatStatsDTO | null;
}

/**
 * Upsert (insert or update) NPC combat stats
 * Uses npc_id as the primary key (1:1 relationship)
 * RLS verification happens via the npcs table relationship
 */
export async function upsertNPCCombatStats(
  npcId: string,
  command: UpsertNPCCombatStatsCommand
): Promise<NPCCombatStatsDTO> {
  const supabase = getSupabaseClient();

  // Get current user for auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('npc_combat_stats')
    .upsert({
      npc_id: npcId,
      hp_max: command.hp_max,
      armor_class: command.armor_class,
      speed: command.speed,
      strength: command.strength,
      dexterity: command.dexterity,
      constitution: command.constitution,
      intelligence: command.intelligence,
      wisdom: command.wisdom,
      charisma: command.charisma,
      actions_json: (command.actions_json as unknown as Json) || null,
      traits_json: (command.traits_json as unknown as Json) || null,
      bonus_actions_json: (command.bonus_actions_json as unknown as Json) || null,
      reactions_json: (command.reactions_json as unknown as Json) || null,
      legendary_actions_json: (command.legendary_actions_json as unknown as Json) || null,
      damage_vulnerabilities: command.damage_vulnerabilities || null,
      damage_resistances: command.damage_resistances || null,
      damage_immunities: command.damage_immunities || null,
      condition_immunities: command.condition_immunities || null,
      gear: command.gear || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to upsert NPC combat stats:', error);
    throw new Error(error.message);
  }

  return data as unknown as NPCCombatStatsDTO;
}

/**
 * Delete NPC combat stats
 * Removes the combat tab data for an NPC
 */
export async function deleteNPCCombatStats(npcId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('npc_combat_stats')
    .delete()
    .eq('npc_id', npcId);

  if (error) {
    console.error('Failed to delete NPC combat stats:', error);
    throw new Error(error.message);
  }
}
