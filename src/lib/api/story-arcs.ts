import { getSupabaseClient } from '@/lib/supabase';
import type { StoryArcDTO, CreateStoryArcCommand, UpdateStoryArcCommand, StoryArcFilters } from '@/types/story-arcs';
import type { Json } from '@/types/database';
import { extractMentionsFromJson } from '@/lib/utils/mentionUtils';
import { batchCreateEntityMentions, deleteMentionsBySource } from '@/lib/api/entity-mentions';

/**
 * Get all story arcs for a campaign with optional filtering
 * Sorted by created_at descending (newest first)
 */
export async function getStoryArcs(
  campaignId: string,
  filters?: StoryArcFilters
): Promise<StoryArcDTO[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('story_arcs')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch story arcs:', error);
    throw new Error(error.message);
  }

  return data as unknown as StoryArcDTO[];
}

/**
 * Get a single story arc by ID
 * RLS will ensure user can only access story arcs from their campaigns
 */
export async function getStoryArc(storyArcId: string): Promise<StoryArcDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('story_arcs')
    .select('*')
    .eq('id', storyArcId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Story arc not found');
    }
    console.error('Failed to fetch story arc:', error);
    throw new Error(error.message);
  }

  return data as unknown as StoryArcDTO;
}

/**
 * Create a new story arc
 * campaign_id is required for RLS
 */
export async function createStoryArc(
  campaignId: string,
  command: CreateStoryArcCommand
): Promise<StoryArcDTO> {
  const supabase = getSupabaseClient();

  // Get current user for auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('story_arcs')
    .insert({
      campaign_id: campaignId,
      title: command.title,
      description_json: (command.description_json as unknown as Json) || null,
      status: command.status || 'planning',
      start_date: command.start_date || null,
      end_date: command.end_date || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create story arc:', error);
    throw new Error(error.message);
  }

  const storyArc = data as unknown as StoryArcDTO;

  // Sync mentions from description_json (non-blocking)
  if (command.description_json) {
    try {
      const mentions = extractMentionsFromJson(command.description_json);
      if (mentions.length > 0) {
        await batchCreateEntityMentions(
          campaignId,
          mentions.map((m) => ({
            source_type: 'story_arc',
            source_id: storyArc.id,
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
  }

  return storyArc;
}

/**
 * Update a story arc
 * RLS will ensure user can only update story arcs from their campaigns
 */
export async function updateStoryArc(
  storyArcId: string,
  command: UpdateStoryArcCommand
): Promise<StoryArcDTO> {
  const supabase = getSupabaseClient();

  const updateData: Record<string, unknown> = {};

  if (command.title !== undefined) updateData.title = command.title;
  if (command.description_json !== undefined) updateData.description_json = command.description_json;
  if (command.status !== undefined) updateData.status = command.status;
  if (command.start_date !== undefined) updateData.start_date = command.start_date;
  if (command.end_date !== undefined) updateData.end_date = command.end_date;

  const { data, error } = await supabase
    .from('story_arcs')
    .update(updateData)
    .eq('id', storyArcId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Story arc not found');
    }
    console.error('Failed to update story arc:', error);
    throw new Error(error.message);
  }

  const storyArc = data as unknown as StoryArcDTO;

  // Sync mentions if description_json was updated (non-blocking)
  if (command.description_json !== undefined) {
    try {
      // Delete old mentions for this field
      await deleteMentionsBySource('story_arc', storyArcId, 'description_json');

      // Extract and create new mentions
      const mentions = extractMentionsFromJson(command.description_json);
      if (mentions.length > 0) {
        await batchCreateEntityMentions(
          storyArc.campaign_id,
          mentions.map((m) => ({
            source_type: 'story_arc',
            source_id: storyArcId,
            source_field: 'description_json',
            mentioned_type: m.entityType,
            mentioned_id: m.id,
          }))
        );
      }
    } catch (mentionError) {
      console.error('Failed to sync mentions on update:', mentionError);
      // Don't fail the update if mention sync fails
    }
  }

  return storyArc;
}

/**
 * Delete a story arc
 * RLS will ensure user can only delete story arcs from their campaigns
 * Quests linked to this arc will have story_arc_id set to NULL (ON DELETE SET NULL)
 */
export async function deleteStoryArc(storyArcId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('story_arcs')
    .delete()
    .eq('id', storyArcId);

  if (error) {
    console.error('Failed to delete story arc:', error);
    throw new Error(error.message);
  }
}
