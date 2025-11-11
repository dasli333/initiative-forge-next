import type { Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';

export type LoreNote = Tables<'lore_notes'>;

/**
 * Lore Note DTO with typed Json fields
 */
export interface LoreNoteDTO extends Omit<LoreNote, 'content_json'> {
  content_json: JSONContent | null;
}

export interface CreateLoreNoteCommand {
  title: string;
  content_json?: JSONContent | null;
  category: string;
  tags?: string[];
}

export interface UpdateLoreNoteCommand {
  title?: string;
  content_json?: JSONContent | null;
  category?: string;
  tags?: string[];
}

export interface LoreNoteFilters {
  category?: string;
  tags?: string[]; // Filter by any of these tags
}
