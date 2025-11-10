import { getSupabaseClient } from '@/lib/supabase';
import type {
  PlayerCharacterCardViewModel,
  PlayerCharacterDetailsViewModel,
  PlayerCharacterCombatStatsDTO,
  CreatePlayerCharacterCommand,
  UpdatePlayerCharacterCommand,
  CreateCombatStatsCommand,
  UpdateCombatStatsCommand,
  PlayerCharacterFilters,
  PCNPCRelationshipDTO,
  PCNPCRelationshipViewModel,
  CreatePCNPCRelationshipCommand,
  UpdatePCNPCRelationshipCommand,
} from '@/types/player-characters';
import type { Json } from '@/types/database';
import { extractMentionsFromJson } from '@/lib/utils/mentionUtils';
import { deleteMentionsBySource, batchCreateEntityMentions } from '@/lib/api/entity-mentions';

// ============================================================================
// CHARACTER CARD QUERIES (LIST VIEW)
// ============================================================================

/**
 * Get character cards for campaign with optional filtering
 * Enriched with faction names and combat stats (hp/ac)
 */
export async function getCharacterCards(
  campaignId: string,
  filters?: PlayerCharacterFilters
): Promise<PlayerCharacterCardViewModel[]> {
  const supabase = getSupabaseClient();

  let query: any = supabase
    .from('player_characters')
    .select(`
      id,
      name,
      class,
      level,
      image_url,
      faction_id,
      factions(name),
      status,
      player_character_combat_stats(hp_max, armor_class)
    `)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  // Apply filters
  if (filters?.faction_id !== undefined) {
    if (filters.faction_id === null) {
      query = query.is('faction_id', null);
    } else {
      query = query.eq('faction_id', filters.faction_id);
    }
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  // Search filter (name or class)
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,class.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch character cards:', error);
    throw new Error(error.message);
  }

  // Map to ViewModel
  return (data as any[]).map((pc: any) => ({
    id: pc.id,
    name: pc.name,
    class: pc.class,
    level: pc.level,
    image_url: pc.image_url,
    faction_id: pc.faction_id,
    faction_name: pc.factions?.name || null,
    status: pc.status,
    hp_max: pc.player_character_combat_stats?.hp_max || null,
    armor_class: pc.player_character_combat_stats?.armor_class || null,
  }));
}

// ============================================================================
// CHARACTER DETAIL QUERIES
// ============================================================================

/**
 * Get full character details including combat stats and relationships
 */
export async function getCharacterDetails(
  characterId: string
): Promise<PlayerCharacterDetailsViewModel> {
  const supabase = getSupabaseClient();

  // 1. Fetch character with faction JOIN
  const { data: character, error: charError } = await supabase
    .from('player_characters')
    .select(`
      *,
      factions(name)
    `)
    .eq('id', characterId)
    .single();

  if (charError) {
    if (charError.code === 'PGRST116') {
      throw new Error('Character not found');
    }
    console.error('Failed to fetch character:', charError);
    throw new Error(charError.message);
  }

  // 2. Fetch combat stats (optional)
  const { data: combatStats, error: combatStatsError } = await supabase
    .from('player_character_combat_stats')
    .select('*')
    .eq('player_character_id', characterId)
    .maybeSingle();

  if (combatStatsError) {
    console.error('Failed to fetch combat stats for character:', characterId, combatStatsError);
    // Don't throw - combat stats are optional, just log the error
  }

  // 3. Fetch relationships with NPC data
  const relationshipsResult = await supabase
    .from('pc_npc_relationships')
    .select(`
      id,
      npc_id,
      relationship_type,
      description,
      npcs(name, image_url)
    `)
    .eq('player_character_id', characterId)
    .order('created_at', { ascending: true });
  const rawRelationships = relationshipsResult.data;
  const relError = relationshipsResult.error;

  if (relError) {
    console.error('Failed to fetch relationships:', relError);
    throw new Error(relError.message);
  }

  // Map relationships
  const relationships: PCNPCRelationshipViewModel[] = (rawRelationships as any[]).map((rel: any) => ({
    id: rel.id,
    npc_id: rel.npc_id,
    npc_name: rel.npcs?.name || 'Unknown',
    npc_image_url: rel.npcs?.image_url || null,
    relationship_type: rel.relationship_type,
    description: rel.description,
  }));

  // Map to DetailsViewModel
  return {
    id: character.id,
    campaign_id: character.campaign_id,
    name: character.name,
    class: character.class,
    level: character.level,
    race: character.race,
    background: character.background,
    alignment: character.alignment as any,
    age: character.age,
    languages: character.languages,
    faction_id: character.faction_id,
    faction_name: (character as any).factions?.name || null,
    image_url: character.image_url,
    biography_json: character.biography_json as any,
    personality_json: character.personality_json as any,
    notes: character.notes as any,
    status: character.status as any,
    combat_stats: combatStats ? {
      player_character_id: combatStats.player_character_id,
      hp_max: combatStats.hp_max,
      armor_class: combatStats.armor_class,
      speed: combatStats.speed,
      strength: combatStats.strength,
      dexterity: combatStats.dexterity,
      constitution: combatStats.constitution,
      intelligence: combatStats.intelligence,
      wisdom: combatStats.wisdom,
      charisma: combatStats.charisma,
      actions_json: combatStats.actions_json as any,
      created_at: combatStats.created_at,
      updated_at: combatStats.updated_at,
    } : null,
    relationships,
    created_at: character.created_at,
    updated_at: character.updated_at,
  };
}

// ============================================================================
// CHARACTER MUTATIONS
// ============================================================================

/**
 * Create a new player character
 * Includes mention extraction from biography/personality
 */
export async function createCharacter(
  campaignId: string,
  command: CreatePlayerCharacterCommand
): Promise<PlayerCharacterDetailsViewModel> {
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
      class: command.class || null,
      level: command.level || null,
      race: command.race || null,
      background: command.background || null,
      alignment: command.alignment || null,
      age: command.age || null,
      languages: command.languages || null,
      faction_id: command.faction_id || null,
      image_url: command.image_url || null,
      biography_json: (command.biography_json as unknown as Json) || null,
      personality_json: (command.personality_json as unknown as Json) || null,
      notes: (command.notes as unknown as Json) || null,
      status: command.status || 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create character:', error);
    throw new Error(error.message);
  }

  // Extract and create entity mentions
  const mentionedFromBio = command.biography_json ? extractMentionsFromJson(command.biography_json) : [];
  const mentionedFromPersonality = command.personality_json ? extractMentionsFromJson(command.personality_json) : [];
  const mentionedFromNotes = command.notes ? extractMentionsFromJson(command.notes) : [];
  const allMentions = [
    ...mentionedFromBio.map(m => ({ ...m, source_field: 'biography_json' })),
    ...mentionedFromPersonality.map(m => ({ ...m, source_field: 'personality_json' })),
    ...mentionedFromNotes.map(m => ({ ...m, source_field: 'notes' }))
  ];

  if (allMentions.length > 0) {
    await batchCreateEntityMentions(
      campaignId,
      allMentions.map(m => ({
        source_type: 'player_character',
        source_id: data.id,
        source_field: m.source_field,
        mentioned_type: m.entityType,
        mentioned_id: m.id,
      }))
    );
  }

  // Fetch full details to return
  return await getCharacterDetails(data.id);
}

/**
 * Update a character
 * Includes mention sync (delete old + create new)
 */
export async function updateCharacter(
  characterId: string,
  command: UpdatePlayerCharacterCommand
): Promise<PlayerCharacterDetailsViewModel> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('player_characters')
    .update({
      name: command.name,
      class: command.class,
      level: command.level,
      race: command.race,
      background: command.background,
      alignment: command.alignment,
      age: command.age,
      languages: command.languages,
      faction_id: command.faction_id,
      image_url: command.image_url,
      biography_json: command.biography_json as unknown as Json,
      personality_json: command.personality_json as unknown as Json,
      notes: command.notes as unknown as Json,
      status: command.status,
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

  // Sync mentions if biography, personality, or notes changed
  if (command.biography_json !== undefined || command.personality_json !== undefined || command.notes !== undefined) {
    // Delete old mentions from updated fields
    if (command.biography_json !== undefined) {
      await deleteMentionsBySource('player_character', characterId, 'biography_json');
    }
    if (command.personality_json !== undefined) {
      await deleteMentionsBySource('player_character', characterId, 'personality_json');
    }
    if (command.notes !== undefined) {
      await deleteMentionsBySource('player_character', characterId, 'notes');
    }

    // Extract new mentions
    const mentionedFromBio = command.biography_json ? extractMentionsFromJson(command.biography_json) : [];
    const mentionedFromPersonality = command.personality_json ? extractMentionsFromJson(command.personality_json) : [];
    const mentionedFromNotes = command.notes ? extractMentionsFromJson(command.notes) : [];
    const allMentions = [
      ...mentionedFromBio.map(m => ({ ...m, source_field: 'biography_json' })),
      ...mentionedFromPersonality.map(m => ({ ...m, source_field: 'personality_json' })),
      ...mentionedFromNotes.map(m => ({ ...m, source_field: 'notes' }))
    ];

    // Create new mentions
    if (allMentions.length > 0) {
      await batchCreateEntityMentions(
        data.campaign_id,
        allMentions.map(m => ({
          source_type: 'player_character',
          source_id: characterId,
          source_field: m.source_field,
          mentioned_type: m.entityType,
          mentioned_id: m.id,
        }))
      );
    }
  }

  // Fetch full details to return
  return await getCharacterDetails(characterId);
}

/**
 * Delete a character
 * Cascade will handle combat_stats and relationships
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

// ============================================================================
// COMBAT STATS MUTATIONS
// ============================================================================

/**
 * Add combat stats to a character
 */
export async function addCombatStats(
  characterId: string,
  command: CreateCombatStatsCommand
): Promise<PlayerCharacterCombatStatsDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('player_character_combat_stats')
    .insert({
      player_character_id: characterId,
      hp_max: command.hp_max,
      armor_class: command.armor_class,
      speed: command.speed,
      strength: command.strength,
      dexterity: command.dexterity,
      constitution: command.constitution,
      intelligence: command.intelligence,
      wisdom: command.wisdom,
      charisma: command.charisma,
      actions_json: (command.actions_json as unknown as Json) || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to add combat stats:', error);
    throw new Error(error.message);
  }

  return data as unknown as PlayerCharacterCombatStatsDTO;
}

/**
 * Update combat stats
 */
export async function updateCombatStats(
  characterId: string,
  command: UpdateCombatStatsCommand
): Promise<PlayerCharacterCombatStatsDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('player_character_combat_stats')
    .update({
      hp_max: command.hp_max,
      armor_class: command.armor_class,
      speed: command.speed,
      strength: command.strength,
      dexterity: command.dexterity,
      constitution: command.constitution,
      intelligence: command.intelligence,
      wisdom: command.wisdom,
      charisma: command.charisma,
      actions_json: command.actions_json as unknown as Json,
    })
    .eq('player_character_id', characterId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Combat stats not found');
    }
    console.error('Failed to update combat stats:', error);
    throw new Error(error.message);
  }

  return data as unknown as PlayerCharacterCombatStatsDTO;
}

/**
 * Remove combat stats from a character
 */
export async function removeCombatStats(characterId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('player_character_combat_stats')
    .delete()
    .eq('player_character_id', characterId);

  if (error) {
    console.error('Failed to remove combat stats:', error);
    throw new Error(error.message);
  }
}

// ============================================================================
// PC-NPC RELATIONSHIP MUTATIONS
// ============================================================================

/**
 * Get relationships for a character
 */
export async function getCharacterRelationships(
  characterId: string
): Promise<PCNPCRelationshipViewModel[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('pc_npc_relationships')
    .select(`
      id,
      npc_id,
      relationship_type,
      description,
      npcs(name, image_url)
    `)
    .eq('player_character_id', characterId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch relationships:', error);
    throw new Error(error.message);
  }

  return (data as any[]).map((rel: any) => ({
    id: rel.id,
    npc_id: rel.npc_id,
    npc_name: rel.npcs?.name || 'Unknown',
    npc_image_url: rel.npcs?.image_url || null,
    relationship_type: rel.relationship_type,
    description: rel.description,
  }));
}

/**
 * Create a relationship between PC and NPC
 */
export async function createPCNPCRelationship(
  characterId: string,
  command: CreatePCNPCRelationshipCommand
): Promise<PCNPCRelationshipDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('pc_npc_relationships')
    .insert({
      player_character_id: characterId,
      npc_id: command.npc_id,
      relationship_type: command.relationship_type,
      description: command.description || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Relationship already exists');
    }
    console.error('Failed to create relationship:', error);
    throw new Error(error.message);
  }

  return data as unknown as PCNPCRelationshipDTO;
}

/**
 * Update a PC-NPC relationship
 */
export async function updatePCNPCRelationship(
  relationshipId: string,
  command: UpdatePCNPCRelationshipCommand
): Promise<PCNPCRelationshipDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('pc_npc_relationships')
    .update({
      relationship_type: command.relationship_type,
      description: command.description,
    })
    .eq('id', relationshipId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Relationship not found');
    }
    console.error('Failed to update relationship:', error);
    throw new Error(error.message);
  }

  return data as unknown as PCNPCRelationshipDTO;
}

/**
 * Delete a PC-NPC relationship
 */
export async function deletePCNPCRelationship(relationshipId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('pc_npc_relationships')
    .delete()
    .eq('id', relationshipId);

  if (error) {
    console.error('Failed to delete relationship:', error);
    throw new Error(error.message);
  }
}
