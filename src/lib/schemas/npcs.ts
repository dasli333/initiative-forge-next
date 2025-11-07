import { z } from 'zod';

// ============================================================================
// NPC FORM SCHEMA
// ============================================================================

/**
 * Schema for NPC form (simplified single-step dialog)
 * Only basic info - biography/personality/combat edited in detail panel
 */
export const npcFormSchema = z.object({
  // Basic Info
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .trim(),

  role: z
    .string()
    .max(100, 'Role must be less than 100 characters')
    .nullable()
    .optional(),

  faction_id: z.string().uuid('Invalid faction ID').nullable().optional(),

  current_location_id: z.string().uuid('Invalid location ID').nullable().optional(),

  status: z.enum(['alive', 'dead', 'unknown']).optional(),

  image_url: z.string().url('Invalid image URL').nullable().optional(),

  // Tag selection
  tag_ids: z.array(z.string().uuid()).max(10, 'Maximum 10 tags per NPC').optional(),
});

export type NPCFormData = z.infer<typeof npcFormSchema>;

// ============================================================================
// ACTION SCHEMA
// ============================================================================

/**
 * Schema for NPC action (used in ActionBuilder)
 */
export const actionSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),

  type: z.enum(['melee_weapon_attack', 'ranged_weapon_attack', 'spell_attack', 'special'], {
    message: 'Invalid action type',
  }),

  attack_bonus: z
    .number()
    .int()
    .min(-10, 'Attack bonus must be between -10 and +20')
    .max(20, 'Attack bonus must be between -10 and +20')
    .nullable()
    .optional(),

  reach: z
    .string()
    .max(50, 'Reach must be less than 50 characters')
    .nullable()
    .optional(),

  range: z
    .string()
    .max(50, 'Range must be less than 50 characters')
    .nullable()
    .optional(),

  damage_dice: z
    .string()
    .regex(/^\d+d\d+$/, 'Invalid dice format (e.g., 2d6)')
    .nullable()
    .optional(),

  damage_bonus: z
    .number()
    .int()
    .min(-10, 'Damage bonus must be between -10 and +20')
    .max(20, 'Damage bonus must be between -10 and +20')
    .nullable()
    .optional(),

  damage_type: z
    .string()
    .max(50, 'Damage type must be less than 50 characters')
    .nullable()
    .optional(),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .nullable()
    .optional(),
});

export type ActionFormData = z.infer<typeof actionSchema>;

// ============================================================================
// RELATIONSHIP SCHEMA
// ============================================================================

/**
 * Schema for NPC relationship
 */
export const relationshipSchema = z
  .object({
    npc_id_1: z.string().uuid('Invalid NPC ID'),

    npc_id_2: z.string().uuid('Invalid NPC ID'),

    relationship_type: z
      .string()
      .min(1, 'Relationship type is required')
      .max(100, 'Relationship type must be less than 100 characters'),

    description: z
      .string()
      .max(500, 'Description must be less than 500 characters')
      .nullable()
      .optional(),
  })
  .refine((data) => data.npc_id_1 !== data.npc_id_2, {
    message: 'Cannot create relationship with self',
    path: ['npc_id_2'],
  });

export type RelationshipFormData = z.infer<typeof relationshipSchema>;

// ============================================================================
// UPDATE SCHEMAS (for inline editing)
// ============================================================================

/**
 * Schema for inline NPC field updates
 */
export const updateNPCFieldSchema = z.object({
  role: z.string().max(100).nullable().optional(),
  faction_id: z.string().uuid().nullable().optional(),
  current_location_id: z.string().uuid().nullable().optional(),
  status: z.enum(['alive', 'dead', 'unknown']).optional(),
  biography_json: z.any().nullable().optional(),
  personality_json: z.any().nullable().optional(),
});

/**
 * Schema for inline relationship field updates
 */
export const updateRelationshipFieldSchema = z.object({
  relationship_type: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
});
