import { getSupabaseClient } from '@/lib/supabase';
import type {
  FactionDTO,
  CreateFactionCommand,
  UpdateFactionCommand,
  FactionDetailsViewModel,
  FactionRelationshipViewModel
} from '@/types/factions';
import type { NPCDTO } from '@/types/npcs';
import type { Json } from '@/types/database';
import { extractMentionsFromJson } from '@/lib/utils/mentionUtils';
import { batchCreateEntityMentions, deleteMentionsBySource, getMentionsOf } from '@/lib/api/entity-mentions';
import { getFactionRelationships } from '@/lib/api/faction-relationships';

/**
 * Get all factions for a campaign
 * Sorted by created_at descending (newest first)
 */
export async function getFactions(campaignId: string): Promise<FactionDTO[]> {
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

  return data as unknown as FactionDTO[];
}

/**
 * Get a single faction by ID
 * RLS will ensure user can only access factions from their campaigns
 */
export async function getFaction(factionId: string): Promise<FactionDTO> {
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

  return data as unknown as FactionDTO;
}

/**
 * Create a new faction
 * campaign_id is required for RLS
 */
export async function createFaction(
  campaignId: string,
  command: CreateFactionCommand
): Promise<FactionDTO> {
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
      description_json: (command.description_json as unknown as Json) || null,
      goals_json: (command.goals_json as unknown as Json) || null,
      resources_json: (command.resources_json as unknown as Json) || null,
      image_url: command.image_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create faction:', error);
    throw new Error(error.message);
  }

  const faction = data as unknown as FactionDTO;

  // Sync mentions from description_json and goals_json (non-blocking)
  try {
    const descriptionMentions = command.description_json
      ? extractMentionsFromJson(command.description_json)
      : [];
    const goalsMentions = command.goals_json
      ? extractMentionsFromJson(command.goals_json)
      : [];

    const allMentions = [
      ...descriptionMentions.map((m) => ({
        source_type: 'faction' as const,
        source_id: faction.id,
        source_field: 'description_json',
        mentioned_type: m.entityType,
        mentioned_id: m.id,
      })),
      ...goalsMentions.map((m) => ({
        source_type: 'faction' as const,
        source_id: faction.id,
        source_field: 'goals_json',
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

  return faction;
}

/**
 * Update a faction
 * RLS will ensure user can only update factions from their campaigns
 */
export async function updateFaction(
  factionId: string,
  command: UpdateFactionCommand
): Promise<FactionDTO> {
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

  const faction = data as unknown as FactionDTO;

  // Resync mentions if description_json or goals_json changed (non-blocking)
  try {
    if (command.description_json !== undefined || command.goals_json !== undefined) {
      // Get campaign_id from faction
      const { data: factionData } = await supabase
        .from('factions')
        .select('campaign_id')
        .eq('id', factionId)
        .single();

      if (!factionData) {
        throw new Error('Faction not found for mention sync');
      }

      const campaignId = factionData.campaign_id;

      // Delete all existing mentions from this faction
      if (command.description_json !== undefined) {
        await deleteMentionsBySource('faction', factionId, 'description_json');
      }
      if (command.goals_json !== undefined) {
        await deleteMentionsBySource('faction', factionId, 'goals_json');
      }

      // Extract new mentions
      const descriptionMentions = command.description_json
        ? extractMentionsFromJson(command.description_json)
        : [];
      const goalsMentions = command.goals_json
        ? extractMentionsFromJson(command.goals_json)
        : [];

      const allMentions = [
        ...descriptionMentions.map((m) => ({
          source_type: 'faction' as const,
          source_id: faction.id,
          source_field: 'description_json',
          mentioned_type: m.entityType,
          mentioned_id: m.id,
        })),
        ...goalsMentions.map((m) => ({
          source_type: 'faction' as const,
          source_id: faction.id,
          source_field: 'goals_json',
          mentioned_type: m.entityType,
          mentioned_id: m.id,
        })),
      ];

      if (allMentions.length > 0) {
        await batchCreateEntityMentions(campaignId, allMentions);
      }
    }
  } catch (mentionError) {
    console.error('Failed to sync mentions on update:', mentionError);
    // Don't fail the update if mention sync fails
  }

  return faction;
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

/**
 * Get full faction details with members, relationships, and backlinks
 * Used in FactionDetailPanel
 */
export async function getFactionDetails(factionId: string): Promise<FactionDetailsViewModel> {
  const supabase = getSupabaseClient();

  // Fetch faction
  const faction = await getFaction(factionId);

  // Fetch NPCs that belong to this faction
  const { data: members, error: membersError } = await supabase
    .from('npcs')
    .select('*')
    .eq('faction_id', factionId)
    .order('name', { ascending: true });

  if (membersError) {
    console.error('Failed to fetch faction members:', membersError);
    throw new Error(membersError.message);
  }

  // Fetch faction relationships (bidirectional)
  const relationshipsRaw = await getFactionRelationships(factionId);

  // Enrich relationships with other faction data
  const enrichedRelationships: FactionRelationshipViewModel[] = await Promise.all(
    relationshipsRaw.map(async (rel) => {
      const otherFactionId = rel.faction_id_1 === factionId ? rel.faction_id_2 : rel.faction_id_1;

      try {
        const otherFaction = await getFaction(otherFactionId);
        return {
          id: rel.id,
          faction_id_1: rel.faction_id_1,
          faction_id_2: rel.faction_id_2,
          relationship_type: rel.relationship_type as 'alliance' | 'war' | 'rivalry' | 'neutral',
          description: rel.description,
          other_faction_id: otherFactionId,
          other_faction_name: otherFaction.name,
          other_faction_image_url: otherFaction.image_url,
        };
      } catch (error) {
        console.error('Failed to fetch other faction:', error);
        return {
          id: rel.id,
          faction_id_1: rel.faction_id_1,
          faction_id_2: rel.faction_id_2,
          relationship_type: rel.relationship_type as 'alliance' | 'war' | 'rivalry' | 'neutral',
          description: rel.description,
          other_faction_id: otherFactionId,
          other_faction_name: 'Unknown',
          other_faction_image_url: null,
        };
      }
    })
  );

  // Fetch backlinks (mentions from other entities)
  const backlinks = await getMentionsOf('faction', factionId);

  const backlinkItems = backlinks.map((mention) => ({
    source_type: mention.source_type as 'npc' | 'quest' | 'session' | 'location' | 'faction' | 'story_arc' | 'lore_note' | 'story_item' | 'player_character',
    source_id: mention.source_id,
    source_name: '', // Will be enriched in component if needed
    source_field: mention.source_field,
  }));

  return {
    faction,
    members: members as unknown as NPCDTO[],
    relationships: enrichedRelationships,
    backlinks: backlinkItems,
  };
}

/**
 * Bulk update NPC factions
 * Assigns multiple NPCs to a faction or unassigns them (faction_id = null)
 */
export async function bulkUpdateNPCFactions(
  npcIds: string[],
  factionId: string | null
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('npcs')
    .update({ faction_id: factionId })
    .in('id', npcIds);

  if (error) {
    console.error('Failed to bulk update NPC factions:', error);
    throw new Error(error.message);
  }
}
