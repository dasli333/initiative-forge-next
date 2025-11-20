import { getSupabaseClient } from '@/lib/supabase';
import type { EntityMention, EntityMentionWithName, CreateEntityMentionCommand } from '@/types/entity-mentions';

/**
 * Get all mentions of a specific entity (backlinks)
 * Example: "Which NPCs/quests/locations mention this NPC?"
 */
export async function getMentionsOf(
  mentionedType: string,
  mentionedId: string
): Promise<EntityMention[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('entity_mentions')
    .select('*')
    .eq('mentioned_type', mentionedType)
    .eq('mentioned_id', mentionedId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch mentions:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete mentions for a specific source and field
 * Called before re-parsing rich text to clear old mentions
 */
export async function deleteMentionsBySource(
  sourceType: string,
  sourceId: string,
  sourceField: string
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('entity_mentions')
    .delete()
    .eq('source_type', sourceType)
    .eq('source_id', sourceId)
    .eq('source_field', sourceField);

  if (error) {
    console.error('Failed to delete entity mentions:', error);
    throw new Error(error.message);
  }
}

/**
 * Batch create entity mentions
 * More efficient when parsing rich text with multiple @mentions
 */
export async function batchCreateEntityMentions(
  campaignId: string,
  mentions: CreateEntityMentionCommand[]
): Promise<EntityMention[]> {
  const supabase = getSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('entity_mentions')
    .insert(
      mentions.map(m => ({
        campaign_id: campaignId,
        source_type: m.source_type,
        source_id: m.source_id,
        source_field: m.source_field,
        mentioned_type: m.mentioned_type,
        mentioned_id: m.mentioned_id,
      }))
    )
    .select();

  if (error) {
    console.error('Failed to batch create entity mentions:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Enrich entity mentions with source entity names
 * Groups by source_type and batch fetches names for efficiency
 */
export async function enrichMentionsWithNames(
  mentions: EntityMention[]
): Promise<EntityMentionWithName[]> {
  if (mentions.length === 0) return [];

  const supabase = getSupabaseClient();

  // Group mentions by source_type
  const mentionsByType = mentions.reduce((acc, mention) => {
    if (!acc[mention.source_type]) {
      acc[mention.source_type] = [];
    }
    acc[mention.source_type].push(mention);
    return acc;
  }, {} as Record<string, EntityMention[]>);

  // Fetch names for each entity type in parallel
  const nameQueries = Object.entries(mentionsByType).map(async ([sourceType, typeMentions]) => {
    const ids = typeMentions.map(m => m.source_id);

    // Map entity types to table/field names
    const typeConfig: Record<string, { table: string; nameField: string; isNumeric?: boolean }> = {
      location: { table: 'locations', nameField: 'name' },
      npc: { table: 'npcs', nameField: 'name' },
      player_character: { table: 'player_characters', nameField: 'name' },
      quest: { table: 'quests', nameField: 'title' },
      session: { table: 'sessions', nameField: 'session_number', isNumeric: true },
      story_arc: { table: 'story_arcs', nameField: 'title' },
      story_item: { table: 'story_items', nameField: 'name' },
      faction: { table: 'factions', nameField: 'name' },
      lore_note: { table: 'lore_notes', nameField: 'title' },
    };

    const config = typeConfig[sourceType];
    if (!config) {
      console.warn(`Unknown source type: ${sourceType}`);
      return { sourceType, names: {} };
    }

    // TypeScript cannot infer types from dynamic config.table string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase.from(config.table as any)
      .select(`id, ${config.nameField}`)
      .in('id', ids);

    if (error) {
      console.error(`Failed to fetch names for ${sourceType}:`, error);
      return { sourceType, names: {} };
    }

    // Build id -> name map
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const names = (data || []).reduce((acc, item: any) => {
      const name = config.isNumeric
        ? `Session #${item[config.nameField]}`
        : item[config.nameField];
      acc[item.id] = name;
      return acc;
    }, {} as Record<string, string>);

    return { sourceType, names };
  });

  const nameResults = await Promise.all(nameQueries);

  // Build lookup map: sourceType -> id -> name
  const nameLookup = nameResults.reduce((acc, { sourceType, names }) => {
    acc[sourceType] = names;
    return acc;
  }, {} as Record<string, Record<string, string>>);

  // Enrich mentions with names
  return mentions.map(mention => ({
    ...mention,
    source_name: nameLookup[mention.source_type]?.[mention.source_id],
  }));
}
