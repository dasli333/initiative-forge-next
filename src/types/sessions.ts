import type { Json, Tables } from '@/types/database';

export type Session = Tables<'sessions'>;

export interface CreateSessionCommand {
  session_number: number; // Manual input
  session_date: string; // YYYY-MM-DD
  in_game_date?: string | null;
  title?: string | null;
  plan_json?: Json | null;
  log_json?: Json | null;
  status?: 'draft' | 'ready' | 'in_progress' | 'completed';
}

export interface UpdateSessionCommand {
  session_number?: number;
  session_date?: string;
  in_game_date?: string | null;
  title?: string | null;
  plan_json?: Json | null;
  log_json?: Json | null;
  status?: 'draft' | 'ready' | 'in_progress' | 'completed';
}

export interface SessionFilters {
  status?: 'draft' | 'ready' | 'in_progress' | 'completed';
}
