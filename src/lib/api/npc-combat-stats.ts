import { getSupabaseClient } from '@/lib/supabase';
import type { NPCCombatStats, UpsertNPCCombatStatsCommand } from '@/types/npc-combat-stats';

/**
 * Get NPC combat stats for a specific NPC
 * Returns null if no combat stats exist (optional 1:1 relationship)
 */
export async function getNPCCombatStats(npcId: string): Promise<NPCCombatStats | null> {
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

  return data;
}

/**
 * Upsert (insert or update) NPC combat stats
 * Uses npc_id as the primary key (1:1 relationship)
 * RLS verification happens via the npcs table relationship
 */
export async function upsertNPCCombatStats(
  npcId: string,
  command: UpsertNPCCombatStatsCommand
): Promise<NPCCombatStats> {
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
      actions_json: command.actions_json || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to upsert NPC combat stats:', error);
    throw new Error(error.message);
  }

  return data;
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
