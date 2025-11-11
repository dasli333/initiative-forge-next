import { getSupabaseClient } from '@/lib/supabase';
import type { EntityMention, CreateEntityMentionCommand } from '@/types/entity-mentions';

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
 * Get all mentions FROM a specific entity (forward links)
 * Example: "Which entities does this NPC mention in its biography?"
 */
export async function getMentionsBy(
  sourceType: string,
  sourceId: string,
  sourceField?: string
): Promise<EntityMention[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('entity_mentions')
    .select('*')
    .eq('source_type', sourceType)
    .eq('source_id', sourceId);

  if (sourceField) {
    query = query.eq('source_field', sourceField);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch mentions:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Create an entity mention
 * Typically called automatically when parsing rich text with @mentions
 */
export async function createEntityMention(command: CreateEntityMentionCommand): Promise<EntityMention> {
  const supabase = getSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get campaign_id from source entity (for RLS)
  // This is a simplified version - in practice, you'd need to fetch campaign_id
  // from the source entity's table
  const { data, error } = await supabase
    .from('entity_mentions')
    .insert({
      campaign_id: '', // TODO: Fetch from source entity
      source_type: command.source_type,
      source_id: command.source_id,
      source_field: command.source_field,
      mentioned_type: command.mentioned_type,
      mentioned_id: command.mentioned_id,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create entity mention:', error);
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
