import { z } from 'zod';
import { LORE_NOTE_CATEGORIES } from '@/types/lore-notes';

// ============================================================================
// LORE NOTE FORM SCHEMA
// ============================================================================

/**
 * Schema for lore note form (create/edit dialog)
 */
export const loreNoteFormSchema = z.object({
  // Basic Info
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),

  category: z.enum(LORE_NOTE_CATEGORIES, {
    message: 'Invalid category',
  }),

  // Rich content
  content_json: z.any().nullable().optional(),
});

export type LoreNoteFormData = z.infer<typeof loreNoteFormSchema>;

// ============================================================================
// UPDATE SCHEMA (for inline editing)
// ============================================================================

/**
 * Schema for inline lore note field updates
 */
export const updateLoreNoteFieldSchema = z.object({
  title: z.string().min(1).max(255).trim().optional(),
  category: z.enum(LORE_NOTE_CATEGORIES).optional(),
  content_json: z.any().nullable().optional(),
});
