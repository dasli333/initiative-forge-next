import { getSupabaseClient } from '@/lib/supabase';
import type { NPCDTO, CreateNPCCommand, UpdateNPCCommand, NPCFilters } from '@/types/npcs';
import type { Json } from '@/types/database';
import { extractMentionsFromJson } from '@/lib/utils/mentionUtils';
import { deleteMentionsBySource, batchCreateEntityMentions } from '@/lib/api/entity-mentions';

/**
 * Get all NPCs for a campaign with optional filtering
 * Sorted by created_at descending (newest first)
 * Enriched with faction, location names, and tags via JOINs
 */
export async function getNPCs(
  campaignId: string,
  filters?: NPCFilters
): Promise<NPCDTO[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('npcs')
    .select(`
      *,
      factions(name),
      locations:current_location_id(name),
      npc_tag_assignments(
        npc_tags(*)
      )
    `)
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

  // Search filter (name or role)
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,role.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch NPCs:', error);
    throw new Error(error.message);
  }

  // Filter by tags if specified (client-side filtering after fetch)
  // Note: Tag filtering requires client-side logic due to many-to-many relationship
  let npcs = data as any[];

  if (filters?.tag_ids && filters.tag_ids.length > 0) {
    npcs = npcs.filter((npc: any) => {
      const npcTagIds = npc.npc_tag_assignments?.map((assignment: any) => assignment.npc_tags?.id) || [];
      // OR logic: NPC has at least one of the selected tags
      return filters.tag_ids!.some((tagId) => npcTagIds.includes(tagId));
    });
  }

  // Type assertion: Supabase returns nested objects from JOINs
  // We'll map these in the React Query hook to flatten faction_name/location_name/tags
  return npcs as unknown as NPCDTO[];
}

/**
 * Get a single NPC by ID
 * RLS will ensure user can only access NPCs from their campaigns
 */
export async function getNPC(npcId: string): Promise<NPCDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('npcs')
    .select(`
      *,
      factions(name),
      locations:current_location_id(name)
    `)
    .eq('id', npcId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('NPC not found');
    }
    console.error('Failed to fetch NPC:', error);
    throw new Error(error.message);
  }

  return data as unknown as NPCDTO;
}

/**
 * Create a new NPC
 * campaign_id is required for RLS
 */
export async function createNPC(
  campaignId: string,
  command: CreateNPCCommand
): Promise<NPCDTO> {
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
      // Character sheet fields
      race: command.race || null,
      age: command.age || null,
      alignment: command.alignment || null,
      languages: command.languages || null,
      distinguishing_features: command.distinguishing_features || null,
      secrets: (command.secrets as unknown as Json) || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create NPC:', error);
    throw new Error(error.message);
  }

  const npc = data as unknown as NPCDTO;

  // Sync mentions from biography_json, personality_json, and secrets (non-blocking)
  try {
    const biographyMentions = command.biography_json
      ? extractMentionsFromJson(command.biography_json)
      : [];
    const personalityMentions = command.personality_json
      ? extractMentionsFromJson(command.personality_json)
      : [];
    const secretsMentions = command.secrets
      ? extractMentionsFromJson(command.secrets)
      : [];

    const allMentions = [
      ...biographyMentions.map((m) => ({
        source_type: 'npc' as const,
        source_id: npc.id,
        source_field: 'biography_json',
        mentioned_type: m.entityType,
        mentioned_id: m.id,
      })),
      ...personalityMentions.map((m) => ({
        source_type: 'npc' as const,
        source_id: npc.id,
        source_field: 'personality_json',
        mentioned_type: m.entityType,
        mentioned_id: m.id,
      })),
      ...secretsMentions.map((m) => ({
        source_type: 'npc' as const,
        source_id: npc.id,
        source_field: 'secrets',
        mentioned_type: m.entityType,
        mentioned_id: m.id,
      })),
    ];

    if (allMentions.length > 0) {
      await batchCreateEntityMentions(campaignId, allMentions);
    }
  } catch (mentionError) {
    console.error('Failed to sync mentions on create:', mentionError);
    // Don't fail the creation if mention sync fails
  }

  return npc;
}

/**
 * Update an NPC
 * RLS will ensure user can only update NPCs from their campaigns
 */
export async function updateNPC(
  npcId: string,
  command: UpdateNPCCommand
): Promise<NPCDTO> {
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
  // Character sheet fields
  if (command.race !== undefined) updateData.race = command.race;
  if (command.age !== undefined) updateData.age = command.age;
  if (command.alignment !== undefined) updateData.alignment = command.alignment;
  if (command.languages !== undefined) updateData.languages = command.languages;
  if (command.distinguishing_features !== undefined) updateData.distinguishing_features = command.distinguishing_features;
  if (command.secrets !== undefined) updateData.secrets = command.secrets as unknown as Json;

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

  const npc = data as unknown as NPCDTO;

  // Sync mentions if biography_json, personality_json, or secrets was updated (non-blocking)
  try {
    if (command.biography_json !== undefined) {
      // Delete old mentions for biography field
      await deleteMentionsBySource('npc', npcId, 'biography_json');

      // Extract and create new mentions
      const mentions = extractMentionsFromJson(command.biography_json);
      if (mentions.length > 0) {
        await batchCreateEntityMentions(
          npc.campaign_id,
          mentions.map((m) => ({
            source_type: 'npc',
            source_id: npcId,
            source_field: 'biography_json',
            mentioned_type: m.entityType,
            mentioned_id: m.id,
          }))
        );
      }
    }

    if (command.personality_json !== undefined) {
      // Delete old mentions for personality field
      await deleteMentionsBySource('npc', npcId, 'personality_json');

      // Extract and create new mentions
      const mentions = extractMentionsFromJson(command.personality_json);
      if (mentions.length > 0) {
        await batchCreateEntityMentions(
          npc.campaign_id,
          mentions.map((m) => ({
            source_type: 'npc',
            source_id: npcId,
            source_field: 'personality_json',
            mentioned_type: m.entityType,
            mentioned_id: m.id,
          }))
        );
      }
    }

    if (command.secrets !== undefined) {
      // Delete old mentions for secrets field
      await deleteMentionsBySource('npc', npcId, 'secrets');

      // Extract and create new mentions
      const mentions = extractMentionsFromJson(command.secrets);
      if (mentions.length > 0) {
        await batchCreateEntityMentions(
          npc.campaign_id,
          mentions.map((m) => ({
            source_type: 'npc',
            source_id: npcId,
            source_field: 'secrets',
            mentioned_type: m.entityType,
            mentioned_id: m.id,
          }))
        );
      }
    }
  } catch (mentionError) {
    console.error('Failed to sync mentions on update:', mentionError);
    // Don't fail the update if mention sync fails
  }

  return npc;
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

/**
 * Get PC relationships for an NPC
 * Returns player characters related to this NPC
 */
export async function getNPCPCRelationships(npcId: string): Promise<import('@/types/npcs').PCRelationshipViewModel[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('pc_npc_relationships')
    .select(`
      id,
      player_character_id,
      relationship_type,
      description,
      player_characters(name, image_url)
    `)
    .eq('npc_id', npcId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch PC relationships:', error);
    throw new Error(error.message);
  }

  return (data as any[]).map((rel: any) => ({
    id: rel.id,
    player_character_id: rel.player_character_id,
    player_character_name: rel.player_characters?.name || 'Unknown',
    player_character_image_url: rel.player_characters?.image_url || null,
    relationship_type: rel.relationship_type,
    description: rel.description,
  }));
}
