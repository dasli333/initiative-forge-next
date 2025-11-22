import { getSupabaseClient } from '@/lib/supabase';
import {
  TimelineEvent,
  TimelineEventDTO,
  CreateTimelineEventCommand,
  UpdateTimelineEventCommand,
  TimelineEventFilters
} from '@/types/timeline-events';
import { RelatedEntity } from '@/types/timeline-view.types';
import { JSONContent } from '@tiptap/react';
import { extractMentionsFromJson } from '@/lib/utils/mentionUtils';
import { deleteMentionsBySource, batchCreateEntityMentions } from '@/lib/api/entity-mentions';

function mapToDTO(event: TimelineEvent): TimelineEventDTO {
  let descriptionJson: JSONContent | null = null;
  let relatedEntities: RelatedEntity[] = [];

  if (event.description_json) {
    try {
      descriptionJson = typeof event.description_json === 'string'
        ? JSON.parse(event.description_json)
        : event.description_json as JSONContent;
    } catch (error) {
      console.error('Failed to parse description_json:', error);
    }
  }

  if (event.related_entities_json) {
    try {
      const parsed = typeof event.related_entities_json === 'string'
        ? JSON.parse(event.related_entities_json)
        : event.related_entities_json;

      if (Array.isArray(parsed)) {
        relatedEntities = parsed.filter((e: any) => e.type && e.id && e.name);
      }
    } catch (error) {
      console.error('Failed to parse related_entities_json:', error);
    }
  }

  return {
    id: event.id,
    campaign_id: event.campaign_id,
    title: event.title,
    description_json: descriptionJson,
    event_date: event.event_date,
    sort_date: event.sort_date,
    related_entities_json: relatedEntities,
    source_type: event.source_type,
    source_id: event.source_id,
    created_at: event.created_at,
    updated_at: event.updated_at,
  };
}

export async function getTimelineEvents(
  campaignId: string,
  filters?: TimelineEventFilters
): Promise<TimelineEventDTO[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('timeline_events')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('sort_date', { ascending: true });

  if (filters?.source_type) {
    query = query.eq('source_type', filters.source_type);
  }

  if (filters?.source_id) {
    query = query.eq('source_id', filters.source_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching timeline events:', error);
    throw error;
  }

  return (data || []).map(mapToDTO);
}

export async function createTimelineEvent(
  campaignId: string,
  command: CreateTimelineEventCommand
): Promise<TimelineEventDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('timeline_events')
    .insert({
      campaign_id: campaignId,
      title: command.title,
      description_json: command.description_json,
      event_date: command.event_date,
      sort_date: command.sort_date,
      related_entities_json: command.related_entities_json || [],
      source_type: command.source_type || 'manual',
      source_id: command.source_id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating timeline event:', error);
    throw error;
  }

  // Sync mentions from description_json (non-blocking)
  if (command.description_json) {
    try {
      const mentions = extractMentionsFromJson(command.description_json);
      if (mentions.length > 0) {
        await batchCreateEntityMentions(
          campaignId,
          mentions.map((m) => ({
            source_type: 'timeline_event',
            source_id: data.id,
            source_field: 'description_json',
            mentioned_type: m.entityType,
            mentioned_id: m.id,
          }))
        );
      }
    } catch (mentionError) {
      console.error('Failed to sync mentions on create:', mentionError);
      // Don't fail the creation if mention sync fails
    }
  }

  return mapToDTO(data);
}

export async function updateTimelineEvent(
  eventId: string,
  command: UpdateTimelineEventCommand
): Promise<TimelineEventDTO> {
  const supabase = getSupabaseClient();

  const updateData: any = {
    title: command.title,
    description_json: command.description_json,
    event_date: command.event_date,
    sort_date: command.sort_date,
    source_type: command.source_type,
    source_id: command.source_id,
  };

  if (command.related_entities_json !== undefined) {
    updateData.related_entities_json = command.related_entities_json;
  }

  const { data, error } = await supabase
    .from('timeline_events')
    .update(updateData)
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    console.error('Error updating timeline event:', error);
    throw error;
  }

  // Sync mentions if description_json was updated (non-blocking)
  if (command.description_json !== undefined) {
    try {
      // Delete old mentions for this field
      await deleteMentionsBySource('timeline_event', eventId, 'description_json');

      // Extract and create new mentions
      const mentions = extractMentionsFromJson(command.description_json);
      if (mentions.length > 0) {
        await batchCreateEntityMentions(
          data.campaign_id,
          mentions.map((m) => ({
            source_type: 'timeline_event',
            source_id: eventId,
            source_field: 'description_json',
            mentioned_type: m.entityType,
            mentioned_id: m.id,
          }))
        );
      }
    } catch (mentionError) {
      console.error('Failed to sync mentions on update:', mentionError);
      // Don't fail the update if mention sync fails
    }
  }

  return mapToDTO(data);
}

export async function deleteTimelineEvent(eventId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('timeline_events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Error deleting timeline event:', error);
    throw error;
  }
}
