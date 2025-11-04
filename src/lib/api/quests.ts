import { getSupabaseClient } from '@/lib/supabase';
import type { Quest, CreateQuestCommand, UpdateQuestCommand, QuestFilters } from '@/types/quests';

/**
 * Get all quests for a campaign with optional filtering
 * Sorted by created_at descending (newest first)
 */
export async function getQuests(
  campaignId: string,
  filters?: QuestFilters
): Promise<Quest[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('quests')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.story_arc_id !== undefined) {
    if (filters.story_arc_id === null) {
      query = query.is('story_arc_id', null);
    } else {
      query = query.eq('story_arc_id', filters.story_arc_id);
    }
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch quests:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get a single quest by ID
 * RLS will ensure user can only access quests from their campaigns
 */
export async function getQuest(questId: string): Promise<Quest> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('id', questId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Quest not found');
    }
    console.error('Failed to fetch quest:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Create a new quest
 * campaign_id is required for RLS
 */
export async function createQuest(
  campaignId: string,
  command: CreateQuestCommand
): Promise<Quest> {
  const supabase = getSupabaseClient();

  // Get current user for auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('quests')
    .insert({
      campaign_id: campaignId,
      story_arc_id: command.story_arc_id || null,
      title: command.title,
      description_json: command.description_json || null,
      objectives_json: command.objectives_json || null,
      rewards_json: command.rewards_json || null,
      status: command.status || 'not_started',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create quest:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update a quest
 * RLS will ensure user can only update quests from their campaigns
 */
export async function updateQuest(
  questId: string,
  command: UpdateQuestCommand
): Promise<Quest> {
  const supabase = getSupabaseClient();

  const updateData: Record<string, unknown> = {};

  if (command.story_arc_id !== undefined) updateData.story_arc_id = command.story_arc_id;
  if (command.title !== undefined) updateData.title = command.title;
  if (command.description_json !== undefined) updateData.description_json = command.description_json;
  if (command.objectives_json !== undefined) updateData.objectives_json = command.objectives_json;
  if (command.rewards_json !== undefined) updateData.rewards_json = command.rewards_json;
  if (command.status !== undefined) updateData.status = command.status;

  const { data, error } = await supabase
    .from('quests')
    .update(updateData)
    .eq('id', questId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Quest not found');
    }
    console.error('Failed to update quest:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a quest
 * RLS will ensure user can only delete quests from their campaigns
 * Quest entities will be deleted (ON DELETE CASCADE)
 */
export async function deleteQuest(questId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('quests')
    .delete()
    .eq('id', questId);

  if (error) {
    console.error('Failed to delete quest:', error);
    throw new Error(error.message);
  }
}
