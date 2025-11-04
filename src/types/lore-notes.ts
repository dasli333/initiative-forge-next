import type { Tables } from '@/types/database';

export type LoreNote = Tables<'lore_notes'>;

export interface CreateLoreNoteCommand {
  title: string;
  content_json?: any;
  category: string;
  tags?: string[];
}

export interface UpdateLoreNoteCommand {
  title?: string;
  content_json?: any;
  category?: string;
  tags?: string[];
}

export interface LoreNoteFilters {
  category?: string;
  tags?: string[]; // Filter by any of these tags
}
