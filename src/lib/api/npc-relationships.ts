import { getSupabaseClient } from '@/lib/supabase';
import type { NPCRelationship, CreateNPCRelationshipCommand, UpdateNPCRelationshipCommand } from '@/types/npc-relationships';

export async function getNPCRelationships(npcId: string): Promise<NPCRelationship[]> {
  const supabase = getSupabaseClient();

  // Get all relationships where this NPC is either npc_id_1 or npc_id_2
  const { data, error } = await supabase
    .from('npc_relationships')
    .select('*')
    .or(`npc_id_1.eq.${npcId},npc_id_2.eq.${npcId}`);

  if (error) {
    console.error('Failed to fetch NPC relationships:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function createNPCRelationship(command: CreateNPCRelationshipCommand): Promise<NPCRelationship> {
  const supabase = getSupabaseClient();

  // Validate npc_id_1 != npc_id_2 on client side
  if (command.npc_id_1 === command.npc_id_2) {
    throw new Error('Cannot create relationship with self');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('npc_relationships')
    .insert({
      npc_id_1: command.npc_id_1,
      npc_id_2: command.npc_id_2,
      relationship_type: command.relationship_type,
      description: command.description || null,
      strength: command.strength ?? 50,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create NPC relationship:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateNPCRelationship(
  relationshipId: string,
  command: UpdateNPCRelationshipCommand
): Promise<NPCRelationship> {
  const supabase = getSupabaseClient();

  const updateData: Record<string, unknown> = {};
  if (command.relationship_type !== undefined) updateData.relationship_type = command.relationship_type;
  if (command.description !== undefined) updateData.description = command.description;
  if (command.strength !== undefined) updateData.strength = command.strength;

  const { data, error } = await supabase
    .from('npc_relationships')
    .update(updateData)
    .eq('id', relationshipId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('NPC relationship not found');
    }
    console.error('Failed to update NPC relationship:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteNPCRelationship(relationshipId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('npc_relationships')
    .delete()
    .eq('id', relationshipId);

  if (error) {
    console.error('Failed to delete NPC relationship:', error);
    throw new Error(error.message);
  }
}
