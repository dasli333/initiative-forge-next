import { getSupabaseClient } from '@/lib/supabase';
import type { StoryItemDTO, CreateStoryItemCommand, UpdateStoryItemCommand, StoryItemFilters } from '@/types/story-items';
import type { Json } from '@/types/database';

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

  return data as unknown as StoryItemDTO[];
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

  return data as unknown as StoryItemDTO;
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

  return data as unknown as StoryItemDTO;
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

  return data as unknown as StoryItemDTO;
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
