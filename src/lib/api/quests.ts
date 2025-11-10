import { getSupabaseClient } from '@/lib/supabase';
import type { QuestDTO, CreateQuestCommand, UpdateQuestCommand, QuestFilters, QuestObjective, QuestRewards, Quest } from '@/types/quests';
import type { Json } from '@/types/database';
import type { JSONContent } from '@tiptap/react';
import { extractMentionsFromJson } from '@/lib/utils/mentionUtils';
import { batchCreateEntityMentions, deleteMentionsBySource } from '@/lib/api/entity-mentions';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate objectives progress
 */
export function calculateObjectivesProgress(objectives: QuestObjective[] | null): {
  completed: number;
  total: number;
  percentage: number;
} {
  if (!objectives || objectives.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  const completed = objectives.filter((obj) => obj.completed).length;
  const total = objectives.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}

/**
 * Format rewards summary for display
 */
export function formatRewardsSummary(rewards: QuestRewards | null): string {
  if (!rewards) return '';

  const parts: string[] = [];
  if (rewards.gold) parts.push(`${rewards.gold}g`);
  if (rewards.xp) parts.push(`${rewards.xp} XP`);
  if (rewards.items && rewards.items.length > 0) {
    parts.push(`${rewards.items.length} item${rewards.items.length > 1 ? 's' : ''}`);
  }
  if (rewards.other) parts.push('other');

  return parts.join(', ');
}

/**
 * Parse JSON fields from raw database response
 */
function parseQuestDTO(raw: Quest & { story_arcs?: { title: string } | null }): QuestDTO {
  return {
    ...raw,
    description_json: raw.description_json as JSONContent | null,
    objectives_json: raw.objectives_json as QuestObjective[] | null,
    rewards_json: raw.rewards_json as QuestRewards | null,
    // Extract joined names
    quest_giver_name: raw.quest_giver?.name || null,
    story_arc_name: raw.story_arc?.title || null,
  };
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all quests for a campaign with optional filtering
 * Sorted by created_at descending (newest first)
 * Includes joined quest_giver and story_arc names
 */
export async function getQuests(
  campaignId: string,
  filters?: QuestFilters
): Promise<QuestDTO[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('quests')
    .select(`
      *,
      quest_giver:quest_giver_id(id, name),
      story_arc:story_arc_id(id, title)
    `)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.quest_type) {
    query = query.eq('quest_type', filters.quest_type);
  }

  if (filters?.story_arc_id !== undefined) {
    if (filters.story_arc_id === null) {
      query = query.is('story_arc_id', null);
    } else {
      query = query.eq('story_arc_id', filters.story_arc_id);
    }
  }

  if (filters?.quest_giver_id !== undefined) {
    if (filters.quest_giver_id === null) {
      query = query.is('quest_giver_id', null);
    } else {
      query = query.eq('quest_giver_id', filters.quest_giver_id);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch quests:', error);
    throw new Error(error.message);
  }

  return data.map(parseQuestDTO);
}

/**
 * Get a single quest by ID
 * RLS will ensure user can only access quests from their campaigns
 * Includes joined quest_giver and story_arc names
 */
export async function getQuest(questId: string): Promise<QuestDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('quests')
    .select(`
      *,
      quest_giver:quest_giver_id(id, name),
      story_arc:story_arc_id(id, title)
    `)
    .eq('id', questId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Quest not found');
    }
    console.error('Failed to fetch quest:', error);
    throw new Error(error.message);
  }

  return parseQuestDTO(data);
}

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Create a new quest
 * campaign_id is required for RLS
 * Syncs @mentions from description_json
 */
export async function createQuest(
  campaignId: string,
  command: CreateQuestCommand
): Promise<QuestDTO> {
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
      title: command.title,
      quest_type: command.quest_type || 'side',
      quest_giver_id: command.quest_giver_id || null,
      story_arc_id: command.story_arc_id || null,
      description_json: (command.description_json as unknown as Json) || null,
      objectives_json: (command.objectives_json as unknown as Json) || null,
      rewards_json: (command.rewards_json as unknown as Json) || null,
      status: command.status || 'not_started',
      notes: command.notes || null,
      start_date: command.start_date || null,
      deadline: command.deadline || null,
    })
    .select(`
      *,
      quest_giver:quest_giver_id(id, name),
      story_arc:story_arc_id(id, title)
    `)
    .single();

  if (error) {
    console.error('Failed to create quest:', error);
    throw new Error(error.message);
  }

  const quest = parseQuestDTO(data);

  // Sync mentions from description_json (non-blocking)
  try {
    const descriptionMentions = command.description_json
      ? extractMentionsFromJson(command.description_json)
      : [];

    if (descriptionMentions.length > 0) {
      await batchCreateEntityMentions(
        campaignId,
        descriptionMentions.map((m) => ({
          source_type: 'quest',
          source_id: quest.id,
          source_field: 'description_json',
          mentioned_type: m.entityType,
          mentioned_id: m.id,
        }))
      );
    }
  } catch (mentionError) {
    console.error('Failed to sync mentions on create:', mentionError);
    // Don't fail the creation if mention sync fails
  }

  return quest;
}

/**
 * Update a quest
 * RLS will ensure user can only update quests from their campaigns
 * Syncs @mentions from description_json if updated
 */
export async function updateQuest(
  questId: string,
  command: UpdateQuestCommand
): Promise<QuestDTO> {
  const supabase = getSupabaseClient();

  const updateData: Record<string, unknown> = {};

  if (command.title !== undefined) updateData.title = command.title;
  if (command.quest_type !== undefined) updateData.quest_type = command.quest_type;
  if (command.quest_giver_id !== undefined) updateData.quest_giver_id = command.quest_giver_id;
  if (command.story_arc_id !== undefined) updateData.story_arc_id = command.story_arc_id;
  if (command.description_json !== undefined) updateData.description_json = command.description_json;
  if (command.objectives_json !== undefined) updateData.objectives_json = command.objectives_json;
  if (command.rewards_json !== undefined) updateData.rewards_json = command.rewards_json;
  if (command.status !== undefined) updateData.status = command.status;
  if (command.notes !== undefined) updateData.notes = command.notes;
  if (command.start_date !== undefined) updateData.start_date = command.start_date;
  if (command.deadline !== undefined) updateData.deadline = command.deadline;

  const { data, error } = await supabase
    .from('quests')
    .update(updateData)
    .eq('id', questId)
    .select(`
      *,
      quest_giver:quest_giver_id(id, name),
      story_arc:story_arc_id(id, title)
    `)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Quest not found');
    }
    console.error('Failed to update quest:', error);
    throw new Error(error.message);
  }

  const quest = parseQuestDTO(data);

  // Sync mentions if description_json was updated (non-blocking)
  try {
    if (command.description_json !== undefined) {
      // Delete old mentions for description field
      await deleteMentionsBySource('quest', questId, 'description_json');

      // Extract and create new mentions
      const mentions = extractMentionsFromJson(command.description_json);
      if (mentions.length > 0) {
        await batchCreateEntityMentions(
          quest.campaign_id,
          mentions.map((m) => ({
            source_type: 'quest',
            source_id: questId,
            source_field: 'description_json',
            mentioned_type: m.entityType,
            mentioned_id: m.id,
          }))
        );
      }
    }
  } catch (mentionError) {
    console.error('Failed to sync mentions on update:', mentionError);
    // Don't fail the update if mention sync fails
  }

  return quest;
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
