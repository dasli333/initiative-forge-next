import { getSupabaseClient } from '@/lib/supabase';
import type { TimelineEvent, CreateTimelineEventCommand, UpdateTimelineEventCommand, TimelineEventFilters } from '@/types/timeline-events';

export async function getTimelineEvents(
  campaignId: string,
  filters?: TimelineEventFilters
): Promise<TimelineEvent[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('timeline_events')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('event_date', { ascending: true }); // Chronological order

  if (filters?.source_type) {
    query = query.eq('source_type', filters.source_type);
  }

  if (filters?.source_id) {
    query = query.eq('source_id', filters.source_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch timeline events:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function getTimelineEvent(eventId: string): Promise<TimelineEvent> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Timeline event not found');
    }
    console.error('Failed to fetch timeline event:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function createTimelineEvent(
  campaignId: string,
  command: CreateTimelineEventCommand
): Promise<TimelineEvent> {
  const supabase = getSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('timeline_events')
    .insert({
      campaign_id: campaignId,
      title: command.title,
      description_json: command.description_json || null,
      event_date: command.event_date,
      real_date: command.real_date || null,
      related_entities_json: command.related_entities_json || null,
      source_type: command.source_type || null,
      source_id: command.source_id || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create timeline event:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateTimelineEvent(
  eventId: string,
  command: UpdateTimelineEventCommand
): Promise<TimelineEvent> {
  const supabase = getSupabaseClient();

  const updateData: any = {};
  if (command.title !== undefined) updateData.title = command.title;
  if (command.description_json !== undefined) updateData.description_json = command.description_json;
  if (command.event_date !== undefined) updateData.event_date = command.event_date;
  if (command.real_date !== undefined) updateData.real_date = command.real_date;
  if (command.related_entities_json !== undefined) updateData.related_entities_json = command.related_entities_json;
  if (command.source_type !== undefined) updateData.source_type = command.source_type;
  if (command.source_id !== undefined) updateData.source_id = command.source_id;

  const { data, error } = await supabase
    .from('timeline_events')
    .update(updateData)
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Timeline event not found');
    }
    console.error('Failed to update timeline event:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteTimelineEvent(eventId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('timeline_events')
    .delete()
    .eq('id', eventId);

  if (error) {
    console.error('Failed to delete timeline event:', error);
    throw new Error(error.message);
  }
}
