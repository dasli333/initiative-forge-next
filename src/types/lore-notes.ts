import type { Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';
import type { LoreNoteTagDTO } from '@/types/lore-note-tags';

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

/**
 * Enriched Lore Note with joined data from Supabase query
 * Used internally in API layer before flattening to LoreNoteDTO
 */
export interface LoreNoteWithJoins extends LoreNoteDTO {
  lore_note_tag_assignments?: Array<{
    lore_note_tags: LoreNoteTagDTO | null;
  }> | null;
}

/**
 * Card view model for lore note list items
 * Includes flattened tags array for display
 */
export interface LoreNoteCardViewModel {
  note: LoreNoteDTO;
  tags: LoreNoteTagDTO[];
}

// ============================================================================
// COMMAND MODELS
// ============================================================================

export interface CreateLoreNoteCommand {
  title: string;
  content_json?: JSONContent | null;
  category: LoreNoteCategory;
}

export interface UpdateLoreNoteCommand {
  title?: string;
  content_json?: JSONContent | null;
  category?: LoreNoteCategory;
}

// ============================================================================
// FILTERS
// ============================================================================

export interface LoreNoteFilters {
  category?: LoreNoteCategory;
  tag_ids?: string[]; // Filter by any of these tag IDs (OR logic)
}
