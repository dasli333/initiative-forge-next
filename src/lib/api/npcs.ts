import { getSupabaseClient } from '@/lib/supabase';
import type { NPCSDTO, CreateNPCCommand, UpdateNPCCommand, NPCFilters } from '@/types/npcs';
import type { Json } from '@/types/database';

/**
 * Get all NPCs for a campaign with optional filtering
 * Sorted by created_at descending (newest first)
 */
export async function getNPCs(
  campaignId: string,
  filters?: NPCFilters
): Promise<NPCSDTO[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('npcs')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.faction_id !== undefined) {
    if (filters.faction_id === null) {
      query = query.is('faction_id', null);
    } else {
      query = query.eq('faction_id', filters.faction_id);
    }
  }

  if (filters?.current_location_id !== undefined) {
    if (filters.current_location_id === null) {
      query = query.is('current_location_id', null);
    } else {
      query = query.eq('current_location_id', filters.current_location_id);
    }
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch NPCs:', error);
    throw new Error(error.message);
  }

  return data as unknown as NPCSDTO[];
}

/**
 * Get a single NPC by ID
 * RLS will ensure user can only access NPCs from their campaigns
 */
export async function getNPC(npcId: string): Promise<NPCSDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('npcs')
    .select('*')
    .eq('id', npcId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('NPC not found');
    }
    console.error('Failed to fetch NPC:', error);
    throw new Error(error.message);
  }

  return data as unknown as NPCSDTO;
}

/**
 * Create a new NPC
 * campaign_id is required for RLS
 */
export async function createNPC(
  campaignId: string,
  command: CreateNPCCommand
): Promise<NPCSDTO> {
  const supabase = getSupabaseClient();

  // Get current user for auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('npcs')
    .insert({
      campaign_id: campaignId,
      name: command.name,
      role: command.role || null,
      biography_json: (command.biography_json as unknown as Json) || null,
      personality_json: (command.personality_json as unknown as Json) || null,
      image_url: command.image_url || null,
      faction_id: command.faction_id || null,
      current_location_id: command.current_location_id || null,
      status: command.status || 'alive',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create NPC:', error);
    throw new Error(error.message);
  }

  return data as unknown as NPCSDTO;
}

/**
 * Update an NPC
 * RLS will ensure user can only update NPCs from their campaigns
 */
export async function updateNPC(
  npcId: string,
  command: UpdateNPCCommand
): Promise<NPCSDTO> {
  const supabase = getSupabaseClient();

  const updateData: Record<string, unknown> = {};

  if (command.name !== undefined) updateData.name = command.name;
  if (command.role !== undefined) updateData.role = command.role;
  if (command.biography_json !== undefined) updateData.biography_json = command.biography_json;
  if (command.personality_json !== undefined) updateData.personality_json = command.personality_json;
  if (command.image_url !== undefined) updateData.image_url = command.image_url;
  if (command.faction_id !== undefined) updateData.faction_id = command.faction_id;
  if (command.current_location_id !== undefined) updateData.current_location_id = command.current_location_id;
  if (command.status !== undefined) updateData.status = command.status;

  const { data, error } = await supabase
    .from('npcs')
    .update(updateData)
    .eq('id', npcId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('NPC not found');
    }
    console.error('Failed to update NPC:', error);
    throw new Error(error.message);
  }

  return data as unknown as NPCSDTO;
}

/**
 * Delete an NPC
 * RLS will ensure user can only delete NPCs from their campaigns
 * Related npc_combat_stats will be deleted (ON DELETE CASCADE)
 */
export async function deleteNPC(npcId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('npcs')
    .delete()
    .eq('id', npcId);

  if (error) {
    console.error('Failed to delete NPC:', error);
    throw new Error(error.message);
  }
}
