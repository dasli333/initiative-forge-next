import { z } from 'zod';

// ============================================================================
// STORY ITEM FORM SCHEMA
// ============================================================================

/**
 * Enum for owner types
 */
export const ownerTypeEnum = z.enum(['npc', 'player_character', 'faction', 'location', 'unknown'], {
  message: 'Invalid owner type',
});

/**
 * Schema for ownership history entry
 */
export const ownershipHistoryEntrySchema = z.object({
  owner_type: z.enum(['npc', 'player_character', 'faction', 'location']),
  owner_id: z.string().uuid('Invalid owner ID'),
  owner_name: z.string().max(200, 'Owner name too long').optional(),
  from: z.string().min(1, 'From date is required').max(100, 'From date too long'), // Fantasy calendar text
  to: z.string().max(100, 'To date too long').nullable(), // null = current owner
  sort_order: z.number().int().min(0, 'Sort order must be non-negative'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').nullable().optional(),
});

/**
 * Schema for ownership history array
 */
export const ownershipHistoryArraySchema = z
  .array(ownershipHistoryEntrySchema)
  .max(10, 'Maximum 10 ownership history entries allowed');

/**
 * Schema for creating a story item
 */
export const createStoryItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters')
    .trim(),

  description_json: z.any().nullable().optional(),

  image_url: z
    .string()
    .url('Invalid image URL')
    .nullable()
    .optional(),

  ownership_history_json: z
    .array(ownershipHistoryEntrySchema)
    .max(10, 'Maximum 10 ownership history entries allowed')
    .nullable()
    .optional(),
});

/**
 * Schema for updating a story item (inline editing)
 */
export const updateStoryItemSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(200, 'Name must be less than 200 characters')
      .trim()
      .optional(),

    description_json: z.any().nullable().optional(),

    image_url: z
      .string()
      .url('Invalid image URL')
      .nullable()
      .optional(),

    ownership_history_json: ownershipHistoryArraySchema.nullable().optional(),
  })
  .refine(
    (data) => {
      // Validation: Historia może mieć MAX 1 entry z to: null
      if (data.ownership_history_json) {
        const currentEntries = data.ownership_history_json.filter(e => e.to === null);
        if (currentEntries.length > 1) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Only one current owner (to: null) allowed in history',
      path: ['ownership_history_json'],
    }
  );

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type StoryItemFormData = z.infer<typeof createStoryItemSchema>;
export type UpdateStoryItemFormData = z.infer<typeof updateStoryItemSchema>;
export type OwnershipHistoryEntryFormData = z.infer<typeof ownershipHistoryEntrySchema>;
