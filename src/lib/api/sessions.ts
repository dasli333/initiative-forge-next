import { getSupabaseClient } from '@/lib/supabase';
import type { Session, CreateSessionCommand, UpdateSessionCommand, SessionFilters } from '@/types/sessions';

export async function getSessions(
  campaignId: string,
  filters?: SessionFilters
): Promise<Session[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('sessions')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('session_number', { ascending: false }); // Latest session first

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch sessions:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function getSession(sessionId: string): Promise<Session> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Session not found');
    }
    console.error('Failed to fetch session:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function createSession(
  campaignId: string,
  command: CreateSessionCommand
): Promise<Session> {
  const supabase = getSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      campaign_id: campaignId,
      session_number: command.session_number,
      session_date: command.session_date,
      in_game_date: command.in_game_date || null,
      title: command.title || null,
      plan_json: command.plan_json || null,
      log_json: command.log_json || null,
      status: command.status || 'draft',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A session with this number already exists in this campaign');
    }
    console.error('Failed to create session:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateSession(
  sessionId: string,
  command: UpdateSessionCommand
): Promise<Session> {
  const supabase = getSupabaseClient();

  const updateData: any = {};
  if (command.session_number !== undefined) updateData.session_number = command.session_number;
  if (command.session_date !== undefined) updateData.session_date = command.session_date;
  if (command.in_game_date !== undefined) updateData.in_game_date = command.in_game_date;
  if (command.title !== undefined) updateData.title = command.title;
  if (command.plan_json !== undefined) updateData.plan_json = command.plan_json;
  if (command.log_json !== undefined) updateData.log_json = command.log_json;
  if (command.status !== undefined) updateData.status = command.status;

  const { data, error } = await supabase
    .from('sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Session not found');
    }
    if (error.code === '23505') {
      throw new Error('A session with this number already exists in this campaign');
    }
    console.error('Failed to update session:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Failed to delete session:', error);
    throw new Error(error.message);
  }
}
