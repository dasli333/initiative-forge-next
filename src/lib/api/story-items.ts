import { getSupabaseClient } from '@/lib/supabase';
import type { StoryItemDTO, CreateStoryItemCommand, UpdateStoryItemCommand, StoryItemFilters } from '@/types/story-items';
import type { Json } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import { extractMentionsFromJson } from '@/lib/utils/mentionUtils';
import { batchCreateEntityMentions, deleteMentionsBySource } from '@/lib/api/entity-mentions';

/**
 * Resolve owner name based on polymorphic owner type and ID
 */
async function resolveOwnerName(
  supabase: SupabaseClient,
  ownerType: string | null,
  ownerId: string | null
): Promise<string | null> {
  if (!ownerType || !ownerId) return null;

  try {
    let tableName: string;
    switch (ownerType) {
      case 'npc':
        tableName = 'npcs';
        break;
      case 'player_character':
        tableName = 'player_characters';
        break;
      case 'faction':
        tableName = 'factions';
        break;
      case 'location':
        tableName = 'locations';
        break;
      default:
        return null;
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('name')
      .eq('id', ownerId)
      .single();

    if (error || !data) return null;
    return data.name;
  } catch {
    return null;
  }
}

export async function getStoryItems(
  campaignId: string,
  filters?: StoryItemFilters
): Promise<StoryItemDTO[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('story_items')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (filters?.current_owner_type) {
    query = query.eq('current_owner_type', filters.current_owner_type);
  }

  if (filters?.current_owner_id) {
    query = query.eq('current_owner_id', filters.current_owner_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch story items:', error);
    throw new Error(error.message);
  }

  // Enrich with owner names
  const enrichedData = await Promise.all(
    data.map(async (item) => {
      const ownerName = await resolveOwnerName(
        supabase,
        item.current_owner_type,
        item.current_owner_id
      );
      return {
        ...(item as unknown as StoryItemDTO),
        current_owner_name: ownerName,
      };
    })
  );

  return enrichedData;
}

export async function getStoryItem(storyItemId: string): Promise<StoryItemDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('story_items')
    .select('*')
    .eq('id', storyItemId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Story item not found');
    }
    console.error('Failed to fetch story item:', error);
    throw new Error(error.message);
  }

  // Enrich with owner name
  const ownerName = await resolveOwnerName(
    supabase,
    data.current_owner_type,
    data.current_owner_id
  );

  // Enrich ownership history with owner names
  let enrichedHistory = data.ownership_history_json;
  if (enrichedHistory && Array.isArray(enrichedHistory)) {
    enrichedHistory = await Promise.all(
      enrichedHistory.map(async (entry: unknown) => {
        const historyEntry = entry as { owner_type: string; owner_id: string; owner_name?: string };
        const resolvedName = await resolveOwnerName(
          supabase,
          historyEntry.owner_type,
          historyEntry.owner_id
        );
        return {
          ...historyEntry,
          owner_name: resolvedName || historyEntry.owner_name || undefined,
        };
      })
    );
  }

  return {
    ...(data as unknown as StoryItemDTO),
    current_owner_name: ownerName,
    ownership_history_json: enrichedHistory as unknown as StoryItemDTO['ownership_history_json'],
  };
}

export async function createStoryItem(
  campaignId: string,
  command: CreateStoryItemCommand
): Promise<StoryItemDTO> {
  const supabase = getSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Initialize ownership history if owner is set
  let ownershipHistory = command.ownership_history_json || null;
  if (command.current_owner_type && command.current_owner_id && !ownershipHistory) {
    ownershipHistory = [{
      owner_type: command.current_owner_type,
      owner_id: command.current_owner_id,
      owner_name: '', // Frontend can populate this
      from: new Date().toISOString(),
      to: null,
    }];
  }

  const { data, error } = await supabase
    .from('story_items')
    .insert({
      campaign_id: campaignId,
      name: command.name,
      description_json: (command.description_json as unknown as Json) || null,
      image_url: command.image_url || null,
      current_owner_type: command.current_owner_type || null,
      current_owner_id: command.current_owner_id || null,
      ownership_history_json: ownershipHistory as unknown as Json,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create story item:', error);
    throw new Error(error.message);
  }

  const storyItem = data as unknown as StoryItemDTO;

  // Sync mentions from description_json (non-blocking)
  if (command.description_json) {
    try {
      const mentions = extractMentionsFromJson(command.description_json);
      if (mentions.length > 0) {
        await batchCreateEntityMentions(
          campaignId,
          mentions.map((m) => ({
            source_type: 'story_item',
            source_id: storyItem.id,
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

  return storyItem;
}

export async function updateStoryItem(
  storyItemId: string,
  command: UpdateStoryItemCommand
): Promise<StoryItemDTO> {
  const supabase = getSupabaseClient();

  // Fetch current item to track ownership changes
  const { data: currentItem } = await supabase
    .from('story_items')
    .select('*')
    .eq('id', storyItemId)
    .single();

  const updateData: Record<string, unknown> = {};
  if (command.name !== undefined) updateData.name = command.name;
  if (command.description_json !== undefined) updateData.description_json = command.description_json;
  if (command.image_url !== undefined) updateData.image_url = command.image_url;

  // AUTO-TRACKING: If owner changes, update ownership history
  const ownerChanged =
    command.current_owner_type !== undefined &&
    command.current_owner_id !== undefined &&
    currentItem &&
    (command.current_owner_type !== currentItem.current_owner_type ||
      command.current_owner_id !== currentItem.current_owner_id);

  if (ownerChanged && currentItem) {
    const now = new Date().toISOString();
    const history = (currentItem.ownership_history_json as unknown[] | null) || [];

    // Close current owner's entry
    const updatedHistory = history.map((entry: unknown) =>
      (entry as { to: string | null }).to === null ? { ...(entry as Record<string, unknown>), to: now } : entry
    );

    // Add new owner entry
    if (command.current_owner_type && command.current_owner_id) {
      updatedHistory.push({
        owner_type: command.current_owner_type,
        owner_id: command.current_owner_id,
        owner_name: '', // Frontend can populate this
        from: now,
        to: null,
      });
    }

    updateData.ownership_history_json = updatedHistory as unknown as Json;
    updateData.current_owner_type = command.current_owner_type;
    updateData.current_owner_id = command.current_owner_id;
  } else {
    if (command.current_owner_type !== undefined) updateData.current_owner_type = command.current_owner_type;
    if (command.current_owner_id !== undefined) updateData.current_owner_id = command.current_owner_id;
  }

  const { data, error } = await supabase
    .from('story_items')
    .update(updateData)
    .eq('id', storyItemId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Story item not found');
    }
    console.error('Failed to update story item:', error);
    throw new Error(error.message);
  }

  const storyItem = data as unknown as StoryItemDTO;

  // Sync mentions if description_json was updated (non-blocking)
  if (command.description_json !== undefined) {
    try {
      // Delete old mentions for this field
      await deleteMentionsBySource('story_item', storyItemId, 'description_json');

      // Extract and create new mentions
      const mentions = extractMentionsFromJson(command.description_json);
      if (mentions.length > 0) {
        await batchCreateEntityMentions(
          storyItem.campaign_id,
          mentions.map((m) => ({
            source_type: 'story_item',
            source_id: storyItemId,
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

  return storyItem;
}

export async function deleteStoryItem(storyItemId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('story_items')
    .delete()
    .eq('id', storyItemId);

  if (error) {
    console.error('Failed to delete story item:', error);
    throw new Error(error.message);
  }
}
