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
  from: z.string(), // ISO date or fantasy calendar text
  to: z.string().nullable(), // null = current owner
  notes: z.string().max(500, 'Notes must be less than 500 characters').nullable().optional(),
});

/**
 * Schema for creating a story item
 */
export const createStoryItemSchema = z
  .object({
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

    current_owner_type: ownerTypeEnum.nullable().optional(),

    current_owner_id: z
      .string()
      .uuid('Invalid owner ID')
      .nullable()
      .optional(),

    ownership_history_json: z
      .array(ownershipHistoryEntrySchema)
      .max(10, 'Maximum 10 ownership history entries allowed')
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // If owner type is set and not 'unknown', owner_id is required
      if (data.current_owner_type && data.current_owner_type !== 'unknown' && !data.current_owner_id) {
        return false;
      }
      return true;
    },
    {
      message: 'Owner is required when owner type is selected',
      path: ['current_owner_id'],
    }
  );

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

    current_owner_type: ownerTypeEnum.nullable().optional(),

    current_owner_id: z
      .string()
      .uuid('Invalid owner ID')
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // If owner type is being set and not 'unknown', owner_id is required
      if (data.current_owner_type !== undefined) {
        if (data.current_owner_type && data.current_owner_type !== 'unknown' && !data.current_owner_id) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Owner is required when owner type is selected',
      path: ['current_owner_id'],
    }
  );

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type StoryItemFormData = z.infer<typeof createStoryItemSchema>;
export type UpdateStoryItemFormData = z.infer<typeof updateStoryItemSchema>;
export type OwnershipHistoryEntryFormData = z.infer<typeof ownershipHistoryEntrySchema>;
