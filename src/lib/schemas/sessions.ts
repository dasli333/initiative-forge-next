import { z } from 'zod';

// ============================================================================
// PLAN JSON SCHEMAS (Session Prep)
// ============================================================================

/**
 * Schema for goal item in session checklist
 */
export const goalItemSchema = z.object({
  id: z.string().uuid('Invalid goal ID'),
  text: z
    .string()
    .min(1, 'Goal text is required')
    .max(500, 'Goal must be less than 500 characters')
    .trim(),
  completed: z.boolean().default(false),
});

/**
 * Schema for planned encounter
 */
export const encounterSchema = z.object({
  id: z.string().uuid('Invalid encounter ID'),
  type: z.enum(['story', 'combat'], {
    message: 'Encounter type must be story or combat',
  }),
  name: z
    .string()
    .min(1, 'Encounter name is required')
    .max(200, 'Encounter name must be less than 200 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
});

/**
 * Schema for pinned entity (quick links)
 */
export const pinnedEntitySchema = z.object({
  id: z.string().uuid('Invalid entity ID'),
  type: z.enum([
    'location',
    'npc',
    'player_character',
    'quest',
    'story_arc',
    'story_item',
    'faction',
    'lore_note',
  ], {
    message: 'Invalid entity type',
  }),
  name: z.string().max(255, 'Entity name too long'),
});

/**
 * Schema for plan JSON structure
 */
export const planJsonSchema = z.object({
  opening: z.any().nullable().optional(), // Tiptap JSONContent
  goals: z
    .array(goalItemSchema)
    .max(50, 'Maximum 50 goals per session')
    .default([]),
  encounters: z
    .array(encounterSchema)
    .max(30, 'Maximum 30 encounters per session')
    .default([]),
  pinned_entities: z
    .array(pinnedEntitySchema)
    .max(20, 'Maximum 20 pinned entities')
    .default([]),
  notes: z.any().nullable().optional(), // Tiptap JSONContent
});

// ============================================================================
// LOG JSON SCHEMAS (Session Journal)
// ============================================================================

/**
 * Schema for key event
 */
export const keyEventSchema = z.object({
  id: z.string().uuid('Invalid event ID'),
  text: z
    .string()
    .min(1, 'Event text is required')
    .max(1000, 'Event must be less than 1000 characters')
    .trim(),
});

/**
 * Schema for loot item
 */
export const lootItemSchema = z.object({
  id: z.string().uuid('Invalid loot item ID'),
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(200, 'Item name must be less than 200 characters')
    .trim(),
});

/**
 * Schema for log JSON structure
 */
export const logJsonSchema = z.object({
  summary: z.any().nullable().optional(), // Tiptap JSONContent
  key_events: z
    .array(keyEventSchema)
    .max(50, 'Maximum 50 key events per session')
    .default([]),
  loot_given: z
    .array(lootItemSchema)
    .max(100, 'Maximum 100 loot items per session')
    .default([]),
  xp_given: z
    .number()
    .int('XP must be a whole number')
    .min(0, 'XP must be non-negative')
    .max(1000000, 'XP amount too large')
    .default(0),
});

// ============================================================================
// SESSION FORM SCHEMAS
// ============================================================================

/**
 * Schema for creating a new session
 */
export const createSessionSchema = z.object({
  session_number: z
    .number()
    .int('Session number must be a whole number')
    .min(1, 'Session number must be at least 1')
    .max(9999, 'Session number too large'),

  session_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),

  in_game_date: z
    .string()
    .max(100, 'In-game date must be less than 100 characters')
    .nullable()
    .optional(),

  title: z
    .string()
    .max(255, 'Title must be less than 255 characters')
    .nullable()
    .optional(),
});

/**
 * Schema for updating session basic info
 */
export const updateSessionBasicSchema = z.object({
  session_number: z
    .number()
    .int()
    .min(1)
    .max(9999)
    .optional(),

  session_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),

  in_game_date: z
    .string()
    .max(100)
    .nullable()
    .optional(),

  title: z
    .string()
    .max(255)
    .nullable()
    .optional(),

  status: z
    .enum(['draft', 'ready', 'in_progress', 'completed'])
    .optional(),
});

/**
 * Full session update schema (basic + plan + log)
 */
export const updateSessionSchema = updateSessionBasicSchema.extend({
  plan_json: planJsonSchema.nullable().optional(),
  log_json: logJsonSchema.nullable().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type GoalItemFormData = z.infer<typeof goalItemSchema>;
export type EncounterFormData = z.infer<typeof encounterSchema>;
export type PinnedEntityFormData = z.infer<typeof pinnedEntitySchema>;
export type PlanJsonFormData = z.infer<typeof planJsonSchema>;

export type KeyEventFormData = z.infer<typeof keyEventSchema>;
export type LootItemFormData = z.infer<typeof lootItemSchema>;
export type LogJsonFormData = z.infer<typeof logJsonSchema>;

export type CreateSessionFormData = z.infer<typeof createSessionSchema>;
export type UpdateSessionFormData = z.infer<typeof updateSessionSchema>;
