import { getSupabaseClient } from '@/lib/supabase';
import type { QuestEntity, AddQuestEntityCommand, UpdateQuestEntityCommand } from '@/types/quest-entities';

/**
 * Get all entities linked to a quest
 */
export async function getQuestEntities(questId: string): Promise<QuestEntity[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('quest_entities')
    .select('*')
    .eq('quest_id', questId);

  if (error) {
    console.error('Failed to fetch quest entities:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get all quests linked to a specific entity
 * Useful for backlinks: "Which quests involve this NPC?"
 */
export async function getQuestsByEntity(
  entityType: string,
  entityId: string
): Promise<QuestEntity[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('quest_entities')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);

  if (error) {
    console.error('Failed to fetch quests by entity:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Add an entity to a quest (many-to-many link)
 * Composite PK: (quest_id, entity_type, entity_id)
 */
export async function addQuestEntity(
  questId: string,
  command: AddQuestEntityCommand
): Promise<QuestEntity> {
  const supabase = getSupabaseClient();

  // Get current user for auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('quest_entities')
    .insert({
      quest_id: questId,
      entity_type: command.entity_type,
      entity_id: command.entity_id,
      role: command.role || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('This entity is already linked to the quest');
    }
    console.error('Failed to add quest entity:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update quest entity role
 */
export async function updateQuestEntity(
  questId: string,
  entityType: string,
  entityId: string,
  command: UpdateQuestEntityCommand
): Promise<QuestEntity> {
  const supabase = getSupabaseClient();

  const updateData: any = {};
  if (command.role !== undefined) updateData.role = command.role;

  const { data, error } = await supabase
    .from('quest_entities')
    .update(updateData)
    .eq('quest_id', questId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Quest entity link not found');
    }
    console.error('Failed to update quest entity:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Remove an entity from a quest
 */
export async function removeQuestEntity(
  questId: string,
  entityType: string,
  entityId: string
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('quest_entities')
    .delete()
    .eq('quest_id', questId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);

  if (error) {
    console.error('Failed to remove quest entity:', error);
    throw new Error(error.message);
  }
}
