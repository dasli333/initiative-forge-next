import { getSupabaseClient } from '@/lib/supabase';
import type {
  LoreNoteTagDTO,
  CreateLoreNoteTagCommand,
  UpdateLoreNoteTagCommand,
  AssignTagToLoreNoteCommand,
  UnassignTagFromLoreNoteCommand,
} from '@/types/lore-note-tags';

// ============================================================================
// LORE NOTE TAGS CRUD
// ============================================================================

/**
 * Get all tags for a campaign
 * Sorted alphabetically by name
 */
export async function getLoreNoteTags(
  campaignId: string
): Promise<LoreNoteTagDTO[]> {
  const supabase = getSupabaseClient();

  const result = await supabase
    .from('lore_note_tags')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('name', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = result as { data: LoreNoteTagDTO[] | null; error: any };

  if (error) {
    console.error('Failed to fetch lore note tags:', error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Get a single tag by ID
 */
export async function getLoreNoteTag(tagId: string): Promise<LoreNoteTagDTO> {
  const supabase = getSupabaseClient();

  const result = (await supabase
    .from('lore_note_tags')
    .select('*')
    .eq('id', tagId)
    .single());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = result as { data: LoreNoteTagDTO | null; error: any };

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Tag not found');
    }
    console.error('Failed to fetch lore note tag:', error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Tag not found');
  }

  return data;
}

/**
 * Create a new tag for a campaign
 */
export async function createLoreNoteTag(
  campaignId: string,
  command: CreateLoreNoteTagCommand
): Promise<LoreNoteTagDTO> {
  const supabase = getSupabaseClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const result = await supabase
    .from('lore_note_tags')
    .insert({
      campaign_id: campaignId,
      name: command.name,
      color: command.color,
      icon: command.icon,
    })
    .select()
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = result as { data: LoreNoteTagDTO | null; error: any };

  if (error) {
    // Handle unique constraint violation (duplicate tag name in campaign)
    if (error.code === '23505') {
      throw new Error('A tag with this name already exists in this campaign');
    }
    console.error('Failed to create lore note tag:', error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Failed to create tag');
  }

  return data;
}

/**
 * Update an existing tag
 */
export async function updateLoreNoteTag(
  tagId: string,
  command: UpdateLoreNoteTagCommand
): Promise<LoreNoteTagDTO> {
  const supabase = getSupabaseClient();

  const result = await supabase
    .from('lore_note_tags')
    .update(command)
    .eq('id', tagId)
    .select()
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = result as { data: LoreNoteTagDTO | null; error: any };

  if (error) {
    if (error.code === '23505') {
      throw new Error('A tag with this name already exists in this campaign');
    }
    console.error('Failed to update lore note tag:', error);
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Failed to update tag');
  }

  return data;
}

/**
 * Delete a tag
 * CASCADE will automatically remove all tag assignments
 */
export async function deleteLoreNoteTag(tagId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('lore_note_tags')
    .delete()
    .eq('id', tagId);

  if (error) {
    console.error('Failed to delete lore note tag:', error);
    throw new Error(error.message);
  }
}

// ============================================================================
// TAG ASSIGNMENTS
// ============================================================================

/**
 * Get all tags assigned to a lore note
 */
export async function getLoreNoteAssignedTags(
  loreNoteId: string
): Promise<LoreNoteTagDTO[]> {
  const supabase = getSupabaseClient();

  const result = await supabase
    .from('lore_note_tag_assignments')
    .select(
      `
      tag_id,
      lore_note_tags (*)
    `
    )
    .eq('lore_note_id', loreNoteId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = result as { data: Array<{ tag_id: string; lore_note_tags: LoreNoteTagDTO }> | null; error: any; };

  if (error) {
    console.error('Failed to fetch lore note assigned tags:', error);
    throw new Error(error.message);
  }

  // Extract tags from JOIN result
  return (data || []).map((assignment) => assignment.lore_note_tags);
}

/**
 * Get all lore notes with a specific tag
 */
export async function getLoreNotesByTag(tagId: string): Promise<string[]> {
  const supabase = getSupabaseClient();

  const result = await supabase
    .from('lore_note_tag_assignments')
    .select('lore_note_id')
    .eq('tag_id', tagId);

  const { data, error } = result

  if (error) {
    console.error('Failed to fetch lore notes by tag:', error);
    throw new Error(error.message);
  }

  return (data || []).map((assignment) => assignment.lore_note_id);
}

/**
 * Assign a tag to a lore note
 */
export async function assignTagToLoreNote(
  command: AssignTagToLoreNoteCommand
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('lore_note_tag_assignments').insert({
    lore_note_id: command.lore_note_id,
    tag_id: command.tag_id,
  });

  if (error) {
    // Handle unique constraint violation (tag already assigned)
    if (error.code === '23505') {
      throw new Error('This tag is already assigned to this lore note');
    }
    console.error('Failed to assign tag to lore note:', error);
    throw new Error(error.message);
  }
}

/**
 * Unassign a tag from a lore note
 */
export async function unassignTagFromLoreNote(
  command: UnassignTagFromLoreNoteCommand
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('lore_note_tag_assignments')
    .delete()
    .eq('lore_note_id', command.lore_note_id)
    .eq('tag_id', command.tag_id);

  if (error) {
    console.error('Failed to unassign tag from lore note:', error);
    throw new Error(error.message);
  }
}

/**
 * Bulk replace all tags for a lore note
 * Deletes all existing assignments and creates new ones
 */
export async function bulkAssignTagsToLoreNote(
  loreNoteId: string,
  tagIds: string[]
): Promise<void> {
  const supabase = getSupabaseClient();

  // Delete all existing assignments
  const { error: deleteError } = await supabase
    .from('lore_note_tag_assignments')
    .delete()
    .eq('lore_note_id', loreNoteId);

  if (deleteError) {
    console.error('Failed to delete existing tag assignments:', deleteError);
    throw new Error(deleteError.message);
  }

  // Insert new assignments (if any)
  if (tagIds.length > 0) {
    const assignments = tagIds.map((tagId) => ({
      lore_note_id: loreNoteId,
      tag_id: tagId,
    }));

    const { error: insertError } = await supabase
      .from('lore_note_tag_assignments')
      .insert(assignments);

    if (insertError) {
      console.error('Failed to create tag assignments:', insertError);
      throw new Error(insertError.message);
    }
  }
}
