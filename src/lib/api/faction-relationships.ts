import { getSupabaseClient } from '@/lib/supabase';
import type { FactionRelationship, CreateFactionRelationshipCommand, UpdateFactionRelationshipCommand } from '@/types/faction-relationships';

export async function getFactionRelationships(factionId: string): Promise<FactionRelationship[]> {
  const supabase = getSupabaseClient();

  // Get all relationships where this faction is either faction_id_1 or faction_id_2
  const { data, error } = await supabase
    .from('faction_relationships')
    .select('*')
    .or(`faction_id_1.eq.${factionId},faction_id_2.eq.${factionId}`);

  if (error) {
    console.error('Failed to fetch faction relationships:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function createFactionRelationship(command: CreateFactionRelationshipCommand): Promise<FactionRelationship> {
  const supabase = getSupabaseClient();

  // Validate faction_id_1 != faction_id_2 on client side
  if (command.faction_id_1 === command.faction_id_2) {
    throw new Error('Cannot create relationship with self');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('faction_relationships')
    .insert({
      faction_id_1: command.faction_id_1,
      faction_id_2: command.faction_id_2,
      relationship_type: command.relationship_type,
      description: command.description || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create faction relationship:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateFactionRelationship(
  relationshipId: string,
  command: UpdateFactionRelationshipCommand
): Promise<FactionRelationship> {
  const supabase = getSupabaseClient();

  const updateData: Record<string, unknown> = {};
  if (command.relationship_type !== undefined) updateData.relationship_type = command.relationship_type;
  if (command.description !== undefined) updateData.description = command.description;

  const { data, error } = await supabase
    .from('faction_relationships')
    .update(updateData)
    .eq('id', relationshipId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Faction relationship not found');
    }
    console.error('Failed to update faction relationship:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteFactionRelationship(relationshipId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('faction_relationships')
    .delete()
    .eq('id', relationshipId);

  if (error) {
    console.error('Failed to delete faction relationship:', error);
    throw new Error(error.message);
  }
}
