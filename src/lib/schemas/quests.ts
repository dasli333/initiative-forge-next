import { z } from 'zod';

// ============================================================================
// QUEST FORM SCHEMA
// ============================================================================

/**
 * Schema for quest objective (simple checklist item)
 */
export const questObjectiveSchema = z.object({
  description: z
    .string()
    .min(1, 'Objective description is required')
    .max(500, 'Objective must be less than 500 characters')
    .trim(),

  completed: z.boolean().default(false),
});

/**
 * Schema for quest rewards
 */
export const questRewardsSchema = z.object({
  gold: z
    .number()
    .int('Gold must be a whole number')
    .min(0, 'Gold must be non-negative')
    .max(1000000, 'Gold amount too large')
    .nullable()
    .optional(),

  xp: z
    .number()
    .int('XP must be a whole number')
    .min(0, 'XP must be non-negative')
    .max(1000000, 'XP amount too large')
    .nullable()
    .optional(),

  items: z
    .array(z.string().max(200, 'Item name too long'))
    .max(50, 'Maximum 50 items')
    .nullable()
    .optional(),

  other: z
    .string()
    .max(1000, 'Other rewards must be less than 1000 characters')
    .nullable()
    .optional(),
});

/**
 * Schema for quest form (create/edit dialog)
 */
export const questFormSchema = z.object({
  // Basic Info
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),

  quest_type: z.enum(['main', 'side'], {
    message: 'Invalid quest type',
  }).default('side'),

  quest_giver_id: z
    .string()
    .uuid('Invalid NPC ID')
    .nullable()
    .optional(),

  story_arc_id: z
    .string()
    .uuid('Invalid story arc ID')
    .nullable()
    .optional(),

  status: z.enum(['not_started', 'active', 'completed', 'failed'], {
    message: 'Invalid status',
  }).default('not_started'),

  // Rich content
  description_json: z.any().nullable().optional(),

  // Objectives (dynamic array)
  objectives_json: z
    .array(questObjectiveSchema)
    .max(50, 'Maximum 50 objectives per quest')
    .nullable()
    .optional(),

  // Rewards
  rewards_json: questRewardsSchema.nullable().optional(),

  // DM Notes & Dates
  notes: z
    .string()
    .max(2000, 'Notes must be less than 2000 characters')
    .nullable()
    .optional(),

  start_date: z
    .string()
    .max(100, 'Start date must be less than 100 characters')
    .nullable()
    .optional(),

  deadline: z
    .string()
    .max(100, 'Deadline must be less than 100 characters')
    .nullable()
    .optional(),
});

export type QuestFormData = z.infer<typeof questFormSchema>;
export type QuestObjectiveFormData = z.infer<typeof questObjectiveSchema>;
export type QuestRewardsFormData = z.infer<typeof questRewardsSchema>;

// ============================================================================
// UPDATE SCHEMA (for inline editing)
// ============================================================================

/**
 * Schema for inline quest field updates
 */
export const updateQuestFieldSchema = z.object({
  title: z.string().min(1).max(255).trim().optional(),
  quest_type: z.enum(['main', 'side']).optional(),
  quest_giver_id: z.string().uuid().nullable().optional(),
  story_arc_id: z.string().uuid().nullable().optional(),
  status: z.enum(['not_started', 'active', 'completed', 'failed']).optional(),
  description_json: z.any().nullable().optional(),
  objectives_json: z.array(questObjectiveSchema).max(50).nullable().optional(),
  rewards_json: questRewardsSchema.nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  start_date: z.string().max(100).nullable().optional(),
  deadline: z.string().max(100).nullable().optional(),
});
