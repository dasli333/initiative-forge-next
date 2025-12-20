import { getSupabaseClient } from '@/lib/supabase';
import type {
  Session,
  SessionDTO,
  CreateSessionCommand,
  UpdateSessionCommand,
  SessionFilters,
  PlanJson,
  LogJson,
} from '@/types/sessions';
import type { Json } from '@/types/database';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse JSON fields from raw database response to typed DTO
 */
function parseSessionDTO(raw: Session): SessionDTO {
  return {
    ...raw,
    plan_json: raw.plan_json as unknown as PlanJson | null,
    log_json: raw.log_json as unknown as LogJson | null,
  };
}

/**
 * Calculate goals progress from plan_json
 */
export function calculateGoalsProgress(planJson: PlanJson | null): {
  completed: number;
  total: number;
} {
  if (!planJson || !planJson.goals || planJson.goals.length === 0) {
    return { completed: 0, total: 0 };
  }

  const completed = planJson.goals.filter((goal) => goal.completed).length;
  return { completed, total: planJson.goals.length };
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all sessions for a campaign with optional filtering
 * Sorted by session_number descending (latest first)
 */
export async function getSessions(
  campaignId: string,
  filters?: SessionFilters
): Promise<SessionDTO[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('sessions')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('session_number', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch sessions:', error);
    throw new Error(error.message);
  }

  return data.map(parseSessionDTO);
}

/**
 * Get a single session by ID
 */
export async function getSession(sessionId: string): Promise<SessionDTO> {
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

  return parseSessionDTO(data);
}

/**
 * Get the next available session number for a campaign
 */
export async function getNextSessionNumber(campaignId: string): Promise<number> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('sessions')
    .select('session_number')
    .eq('campaign_id', campaignId)
    .order('session_number', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Failed to get next session number:', error);
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return 1;
  }

  return data[0].session_number + 1;
}

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

/**
 * Create a new session
 */
export async function createSession(
  campaignId: string,
  command: CreateSessionCommand
): Promise<SessionDTO> {
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
      plan_json: (command.plan_json as unknown as Json) || null,
      log_json: (command.log_json as unknown as Json) || null,
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

  return parseSessionDTO(data);
}

/**
 * Update a session
 */
export async function updateSession(
  sessionId: string,
  command: UpdateSessionCommand
): Promise<SessionDTO> {
  const supabase = getSupabaseClient();

  const updateData: Record<string, unknown> = {};
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

  return parseSessionDTO(data);
}

/**
 * Delete a session
 */
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
