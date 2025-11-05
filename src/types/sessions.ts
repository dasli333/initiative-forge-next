import type { Json, Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';

export type Session = Tables<'sessions'>;

/**
 * Session DTO with typed Json fields
 */
export interface SessionDTO extends Omit<Session, 'plan_json' | 'log_json'> {
  plan_json: JSONContent | null;
  log_json: JSONContent | null;
}

export interface CreateSessionCommand {
  session_number: number; // Manual input
  session_date: string; // YYYY-MM-DD
  in_game_date?: string | null;
  title?: string | null;
  plan_json?: JSONContent | null;
  log_json?: JSONContent | null;
  status?: 'draft' | 'ready' | 'in_progress' | 'completed';
}

export interface UpdateSessionCommand {
  session_number?: number;
  session_date?: string;
  in_game_date?: string | null;
  title?: string | null;
  plan_json?: JSONContent | null;
  log_json?: JSONContent | null;
  status?: 'draft' | 'ready' | 'in_progress' | 'completed';
}

export interface SessionFilters {
  status?: 'draft' | 'ready' | 'in_progress' | 'completed';
}
