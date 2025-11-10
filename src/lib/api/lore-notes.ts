import { getSupabaseClient } from '@/lib/supabase';
import type { LoreNoteDTO, CreateLoreNoteCommand, UpdateLoreNoteCommand, LoreNoteFilters } from '@/types/lore-notes';
import type { Json } from '@/types/database';

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
      title: command.title,
      content_json: (command.content_json as unknown as Json) || null,
      category: command.category,
      tags: command.tags || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create lore note:', error);
    throw new Error(error.message);
  }

  return data as unknown as LoreNoteDTO;
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

  return data as unknown as LoreNoteDTO;
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
