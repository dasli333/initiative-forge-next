import type { Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';

// ============================================================================
// ENUMS
// ============================================================================

export const LORE_NOTE_CATEGORIES = [
  'History',
  'Geography',
  'Religion',
  'Culture',
  'Magic',
  'Legends',
  'Other',
] as const;

export type LoreNoteCategory = typeof LORE_NOTE_CATEGORIES[number];

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type LoreNote = Tables<'lore_notes'>;

/**
 * Lore Note DTO with typed Json fields
 */
export interface LoreNoteDTO extends Omit<LoreNote, 'content_json'> {
  content_json: JSONContent | null;
}

// ============================================================================
// COMMAND MODELS
// ============================================================================

export interface CreateLoreNoteCommand {
  title: string;
  content_json?: JSONContent | null;
  category: LoreNoteCategory;
  tags?: string[];
}

export interface UpdateLoreNoteCommand {
  title?: string;
  content_json?: JSONContent | null;
  category?: LoreNoteCategory;
  tags?: string[];
}

// ============================================================================
// FILTERS
// ============================================================================

export interface LoreNoteFilters {
  category?: LoreNoteCategory;
  tags?: string[]; // Filter by any of these tags (OR logic)
}
