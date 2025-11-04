import { getSupabaseClient } from '@/lib/supabase';
import type { Faction, CreateFactionCommand, UpdateFactionCommand } from '@/types/factions';

/**
 * Get all factions for a campaign
 * Sorted by created_at descending (newest first)
 */
export async function getFactions(campaignId: string): Promise<Faction[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('factions')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch factions:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get a single faction by ID
 * RLS will ensure user can only access factions from their campaigns
 */
export async function getFaction(factionId: string): Promise<Faction> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('factions')
    .select('*')
    .eq('id', factionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Faction not found');
    }
    console.error('Failed to fetch faction:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Create a new faction
 * campaign_id is required for RLS
 */
export async function createFaction(
  campaignId: string,
  command: CreateFactionCommand
): Promise<Faction> {
  const supabase = getSupabaseClient();

  // Get current user for auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('factions')
    .insert({
      campaign_id: campaignId,
      name: command.name,
      description_json: command.description_json || null,
      goals_json: command.goals_json || null,
      resources_json: command.resources_json || null,
      image_url: command.image_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create faction:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update a faction
 * RLS will ensure user can only update factions from their campaigns
 */
export async function updateFaction(
  factionId: string,
  command: UpdateFactionCommand
): Promise<Faction> {
  const supabase = getSupabaseClient();

  const updateData: Record<string, unknown> = {};

  if (command.name !== undefined) updateData.name = command.name;
  if (command.description_json !== undefined) updateData.description_json = command.description_json;
  if (command.goals_json !== undefined) updateData.goals_json = command.goals_json;
  if (command.resources_json !== undefined) updateData.resources_json = command.resources_json;
  if (command.image_url !== undefined) updateData.image_url = command.image_url;

  const { data, error } = await supabase
    .from('factions')
    .update(updateData)
    .eq('id', factionId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Faction not found');
    }
    console.error('Failed to update faction:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a faction
 * RLS will ensure user can only delete factions from their campaigns
 * NPCs with this faction_id will have it set to NULL (ON DELETE SET NULL)
 */
export async function deleteFaction(factionId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('factions')
    .delete()
    .eq('id', factionId);

  if (error) {
    console.error('Failed to delete faction:', error);
    throw new Error(error.message);
  }
}
