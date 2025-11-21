import { getSupabaseClient } from '@/lib/supabase';
import type { LoreNoteDTO, CreateLoreNoteCommand, UpdateLoreNoteCommand, LoreNoteFilters } from '@/types/lore-notes';
import type { Json } from '@/types/database';
import { extractMentionsFromJson } from '@/lib/utils/mentionUtils';
import { batchCreateEntityMentions, deleteMentionsBySource } from '@/lib/api/entity-mentions';

export async function getLoreNotes(
  campaignId: string,
  filters?: LoreNoteFilters
): Promise<LoreNoteDTO[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('lore_notes')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.tags && filters.tags.length > 0) {
    // PostgreSQL array overlap operator: tags && ARRAY['tag1', 'tag2']
    query = query.overlaps('tags', filters.tags);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch lore notes:', error);
    throw new Error(error.message);
  }

  return data as unknown as LoreNoteDTO[];
}

export async function getLoreNote(loreNoteId: string): Promise<LoreNoteDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('lore_notes')
    .select('*')
    .eq('id', loreNoteId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Lore note not found');
    }
    console.error('Failed to fetch lore note:', error);
    throw new Error(error.message);
  }

  return data as unknown as LoreNoteDTO;
}

/**
 * Search lore notes by title
 * Uses case-insensitive ILIKE search on title
 */
export async function searchLoreNotes(
  campaignId: string,
  searchQuery: string
): Promise<LoreNoteDTO[]> {
  if (!searchQuery.trim()) {
    return getLoreNotes(campaignId);
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('lore_notes')
    .select('*')
    .eq('campaign_id', campaignId)
    .ilike('title', `%${searchQuery}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to search lore notes:', error);
    throw new Error(error.message);
  }

  return data as unknown as LoreNoteDTO[];
}

export async function createLoreNote(
  campaignId: string,
  command: CreateLoreNoteCommand
): Promise<LoreNoteDTO> {
  const supabase = getSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('lore_notes')
    .insert({
      campaign_id: campaignId,
      user_id: user.id,
      title: command.title,
      content_json: (command.content_json as unknown as Json) || null,
      category: command.category,
      tags: command.tags || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create lore note:', error);
    throw new Error(error.message);
  }

  const note = data as unknown as LoreNoteDTO;

  // Sync mentions from content_json (non-blocking)
  try {
    const contentMentions = command.content_json
      ? extractMentionsFromJson(command.content_json)
      : [];

    if (contentMentions.length > 0) {
      await batchCreateEntityMentions(
        campaignId,
        contentMentions.map((m) => ({
          source_type: 'lore_note',
          source_id: note.id,
          source_field: 'content_json',
          mentioned_type: m.entityType,
          mentioned_id: m.id,
        }))
      );
    }
  } catch (mentionError) {
    console.error('Failed to sync mentions on create:', mentionError);
    // Don't fail the creation if mention sync fails
  }

  return note;
}

export async function updateLoreNote(
  loreNoteId: string,
  command: UpdateLoreNoteCommand
): Promise<LoreNoteDTO> {
  const supabase = getSupabaseClient();

  const updateData: Record<string, unknown> = {};
  if (command.title !== undefined) updateData.title = command.title;
  if (command.content_json !== undefined) updateData.content_json = command.content_json;
  if (command.category !== undefined) updateData.category = command.category;
  if (command.tags !== undefined) updateData.tags = command.tags;

  const { data, error } = await supabase
    .from('lore_notes')
    .update(updateData)
    .eq('id', loreNoteId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Lore note not found');
    }
    console.error('Failed to update lore note:', error);
    throw new Error(error.message);
  }

  const note = data as unknown as LoreNoteDTO;

  // If content_json was updated, re-sync mentions
  if (command.content_json !== undefined) {
    try {
      // Delete old mentions from content_json
      await deleteMentionsBySource('lore_note', loreNoteId, 'content_json');

      // Create new mentions
      const contentMentions = command.content_json
        ? extractMentionsFromJson(command.content_json)
        : [];

      if (contentMentions.length > 0) {
        await batchCreateEntityMentions(
          note.campaign_id,
          contentMentions.map((m) => ({
            source_type: 'lore_note',
            source_id: note.id,
            source_field: 'content_json',
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

  return note;
}

export async function deleteLoreNote(loreNoteId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('lore_notes')
    .delete()
    .eq('id', loreNoteId);

  if (error) {
    console.error('Failed to delete lore note:', error);
    throw new Error(error.message);
  }
}
