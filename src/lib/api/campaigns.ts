import { getSupabaseClient } from '@/lib/supabase';
import type { Campaign, CreateCampaignCommand, UpdateCampaignCommand } from '@/types';

/**
 * Get all campaigns for the authenticated user
 * Sorted by created_at descending (newest first)
 */
export async function getCampaigns(): Promise<Campaign[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch campaigns:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get a single campaign by ID
 * RLS will ensure user can only access their own campaigns
 */
export async function getCampaign(campaignId: string): Promise<Campaign> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Campaign not found');
    }
    console.error('Failed to fetch campaign:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Create a new campaign
 * user_id is automatically set by RLS
 */
export async function createCampaign(command: CreateCampaignCommand): Promise<Campaign> {
  const supabase = getSupabaseClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      name: command.name,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A campaign with this name already exists');
    }
    console.error('Failed to create campaign:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update a campaign's name
 * RLS will ensure user can only update their own campaigns
 */
export async function updateCampaign(
  campaignId: string,
  command: UpdateCampaignCommand
): Promise<Campaign> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('campaigns')
    .update({ name: command.name })
    .eq('id', campaignId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Campaign not found');
    }
    if (error.code === '23505') {
      throw new Error('A campaign with this name already exists');
    }
    console.error('Failed to update campaign:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a campaign and all associated data (CASCADE)
 * RLS will ensure user can only delete their own campaigns
 */
export async function deleteCampaign(campaignId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId);

  if (error) {
    console.error('Failed to delete campaign:', error);
    throw new Error(error.message);
  }
}
