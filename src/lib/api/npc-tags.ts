import { getSupabaseClient } from '@/lib/supabase';
import type {
  NPCTagDTO,
  CreateNPCTagCommand,
  UpdateNPCTagCommand,
  AssignTagToNPCCommand,
  UnassignTagFromNPCCommand,
} from '@/types/npc-tags';

// ============================================================================
// NPC TAGS CRUD
// ============================================================================

/**
 * Get all tags for a campaign
 * Sorted alphabetically by name
 */
export async function getNPCTags(campaignId: string): Promise<NPCTagDTO[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('npc_tags')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch NPC tags:', error);
    throw new Error(error.message);
  }

  return data as NPCTagDTO[];
}

/**
 * Get a single tag by ID
 */
export async function getNPCTag(tagId: string): Promise<NPCTagDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('npc_tags')
    .select('*')
    .eq('id', tagId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Tag not found');
    }
    console.error('Failed to fetch NPC tag:', error);
    throw new Error(error.message);
  }

  return data as NPCTagDTO;
}

/**
 * Create a new tag for a campaign
 */
export async function createNPCTag(
  campaignId: string,
  command: CreateNPCTagCommand
): Promise<NPCTagDTO> {
  const supabase = getSupabaseClient();

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('npc_tags')
    .insert({
      campaign_id: campaignId,
      name: command.name,
      color: command.color,
      icon: command.icon,
    })
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation (duplicate tag name in campaign)
    if (error.code === '23505') {
      throw new Error('A tag with this name already exists in this campaign');
    }
    console.error('Failed to create NPC tag:', error);
    throw new Error(error.message);
  }

  return data as NPCTagDTO;
}

/**
 * Update an existing tag
 */
export async function updateNPCTag(
  tagId: string,
  command: UpdateNPCTagCommand
): Promise<NPCTagDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('npc_tags')
    .update(command)
    .eq('id', tagId)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A tag with this name already exists in this campaign');
    }
    console.error('Failed to update NPC tag:', error);
    throw new Error(error.message);
  }

  return data as NPCTagDTO;
}

/**
 * Delete a tag
 * CASCADE will automatically remove all tag assignments
 */
export async function deleteNPCTag(tagId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('npc_tags').delete().eq('id', tagId);

  if (error) {
    console.error('Failed to delete NPC tag:', error);
    throw new Error(error.message);
  }
}

// ============================================================================
// TAG ASSIGNMENTS
// ============================================================================

/**
 * Get all tags assigned to an NPC
 */
export async function getNPCAssignedTags(npcId: string): Promise<NPCTagDTO[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('npc_tag_assignments')
    .select(
      `
      tag_id,
      npc_tags (*)
    `
    )
    .eq('npc_id', npcId);

  if (error) {
    console.error('Failed to fetch NPC assigned tags:', error);
    throw new Error(error.message);
  }

  // Extract tags from JOIN result
  return data.map((assignment: any) => assignment.npc_tags) as NPCTagDTO[];
}

/**
 * Get all NPCs with a specific tag
 */
export async function getNPCsByTag(tagId: string): Promise<string[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('npc_tag_assignments')
    .select('npc_id')
    .eq('tag_id', tagId);

  if (error) {
    console.error('Failed to fetch NPCs by tag:', error);
    throw new Error(error.message);
  }

  return data.map((assignment) => assignment.npc_id);
}

/**
 * Assign a tag to an NPC
 */
export async function assignTagToNPC(
  command: AssignTagToNPCCommand
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('npc_tag_assignments').insert({
    npc_id: command.npc_id,
    tag_id: command.tag_id,
  });

  if (error) {
    // Handle unique constraint violation (tag already assigned)
    if (error.code === '23505') {
      throw new Error('This tag is already assigned to this NPC');
    }
    console.error('Failed to assign tag to NPC:', error);
    throw new Error(error.message);
  }
}

/**
 * Unassign a tag from an NPC
 */
export async function unassignTagFromNPC(
  command: UnassignTagFromNPCCommand
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('npc_tag_assignments')
    .delete()
    .eq('npc_id', command.npc_id)
    .eq('tag_id', command.tag_id);

  if (error) {
    console.error('Failed to unassign tag from NPC:', error);
    throw new Error(error.message);
  }
}

/**
 * Bulk replace all tags for an NPC
 * Deletes all existing assignments and creates new ones
 */
export async function bulkAssignTagsToNPC(
  npcId: string,
  tagIds: string[]
): Promise<void> {
  const supabase = getSupabaseClient();

  // Delete all existing assignments
  const { error: deleteError } = await supabase
    .from('npc_tag_assignments')
    .delete()
    .eq('npc_id', npcId);

  if (deleteError) {
    console.error('Failed to delete existing tag assignments:', deleteError);
    throw new Error(deleteError.message);
  }

  // Insert new assignments (if any)
  if (tagIds.length > 0) {
    const assignments = tagIds.map((tagId) => ({
      npc_id: npcId,
      tag_id: tagId,
    }));

    const { error: insertError } = await supabase
      .from('npc_tag_assignments')
      .insert(assignments);

    if (insertError) {
      console.error('Failed to create tag assignments:', insertError);
      throw new Error(insertError.message);
    }
  }
}
