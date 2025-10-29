import { getSupabaseClient } from '@/lib/supabase';
import type { PlayerCharacterDTO, CreatePlayerCharacterCommand, UpdatePlayerCharacterCommand } from '@/types';
import type { Json } from '@/types/database';

/**
 * Get all characters in a campaign
 * RLS will ensure user can only access characters from their campaigns
 */
export async function getCharacters(campaignId: string): Promise<PlayerCharacterDTO[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('player_characters')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch characters:', error);
    throw new Error(error.message);
  }

  return data as unknown as PlayerCharacterDTO[];
}

/**
 * Get a single character by ID
 * RLS will ensure user can only access characters from their campaigns
 */
export async function getCharacter(characterId: string): Promise<PlayerCharacterDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('player_characters')
    .select('*')
    .eq('id', characterId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Character not found');
    }
    console.error('Failed to fetch character:', error);
    throw new Error(error.message);
  }

  return data as unknown as PlayerCharacterDTO;
}

/**
 * Create a new character in a campaign
 * RLS will verify campaign ownership
 */
export async function createCharacter(
  campaignId: string,
  command: CreatePlayerCharacterCommand
): Promise<PlayerCharacterDTO> {
  const supabase = getSupabaseClient();

  // Check if character name already exists in campaign
  const { data: existing } = await supabase
    .from('player_characters')
    .select('id')
    .eq('campaign_id', campaignId)
    .eq('name', command.name)
    .maybeSingle();

  if (existing) {
    throw new Error('A character with this name already exists in this campaign');
  }

  const { data, error } = await supabase
    .from('player_characters')
    .insert({
      campaign_id: campaignId,
      name: command.name,
      max_hp: command.max_hp,
      armor_class: command.armor_class,
      speed: command.speed,
      strength: command.strength,
      dexterity: command.dexterity,
      constitution: command.constitution,
      intelligence: command.intelligence,
      wisdom: command.wisdom,
      charisma: command.charisma,
      actions: (command.actions || null) as unknown as Json,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create character:', error);
    throw new Error(error.message);
  }

  return data as unknown as PlayerCharacterDTO;
}

/**
 * Update a character
 * RLS will ensure user can only update characters from their campaigns
 */
export async function updateCharacter(
  characterId: string,
  command: UpdatePlayerCharacterCommand
): Promise<PlayerCharacterDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('player_characters')
    .update({
      name: command.name,
      max_hp: command.max_hp,
      armor_class: command.armor_class,
      speed: command.speed,
      strength: command.strength,
      dexterity: command.dexterity,
      constitution: command.constitution,
      intelligence: command.intelligence,
      wisdom: command.wisdom,
      charisma: command.charisma,
      actions: command.actions as unknown as Json,
    })
    .eq('id', characterId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Character not found');
    }
    console.error('Failed to update character:', error);
    throw new Error(error.message);
  }

  return data as unknown as PlayerCharacterDTO;
}

/**
 * Delete a character
 * RLS will ensure user can only delete characters from their campaigns
 */
export async function deleteCharacter(characterId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('player_characters')
    .delete()
    .eq('id', characterId);

  if (error) {
    console.error('Failed to delete character:', error);
    throw new Error(error.message);
  }
}
