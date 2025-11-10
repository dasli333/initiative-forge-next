import { z } from 'zod';
import { TAG_COLORS, TAG_ICONS, type TagColor, type TagIcon } from '@/types/npc-tags';

// ============================================================================
// NPC TAG SCHEMA
// ============================================================================

/**
 * Schema for creating/editing NPC tags
 */
export const npcTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be less than 50 characters')
    .trim(),

  color: z
    .string()
    .refine(
      (val): val is TagColor | `#${string}` => TAG_COLORS.includes(val as TagColor) || /^#[0-9A-F]{6}$/i.test(val),
      'Color must be a valid Tailwind color or hex code'
    ),

  icon: z
    .string()
    .refine((val): val is TagIcon => TAG_ICONS.includes(val as TagIcon), 'Invalid icon name'),
});

export type NPCTagFormData = z.infer<typeof npcTagSchema>;

// ============================================================================
// TAG ASSIGNMENT SCHEMA
// ============================================================================

/**
 * Schema for assigning/unassigning tags to NPCs
 */
export const assignTagSchema = z.object({
  npc_id: z.string().uuid('Invalid NPC ID'),
  tag_id: z.string().uuid('Invalid tag ID'),
});

export type AssignTagFormData = z.infer<typeof assignTagSchema>;

// ============================================================================
// BULK TAG ASSIGNMENT SCHEMA
// ============================================================================

/**
 * Schema for bulk tag assignment (used in forms)
 */
export const bulkAssignTagsSchema = z.object({
  npc_id: z.string().uuid('Invalid NPC ID'),
  tag_ids: z.array(z.string().uuid()).max(10, 'Maximum 10 tags per NPC'),
});

export type BulkAssignTagsFormData = z.infer<typeof bulkAssignTagsSchema>;
