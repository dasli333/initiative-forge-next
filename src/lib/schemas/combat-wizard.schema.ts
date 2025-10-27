import { z } from "zod";
import { CombatStatsSchema } from "./combat.schema";
import { PlayerCharacterActionSchema } from "./action.schema";

/**
 * Step 1: Combat Name validation
 */
export const CombatNameSchema = z.object({
  combatName: z
    .string()
    .min(1, "Combat name is required")
    .max(255, "Combat name must be 255 characters or less")
    .trim(),
});

export type CombatNameInput = z.infer<typeof CombatNameSchema>;

/**
 * Step 2: Player Character selection validation
 */
export const PlayerCharacterSelectionSchema = z.object({
  selectedPlayerCharacterIds: z
    .array(z.string().uuid())
    .min(1, "Please select at least one player character"),
});

export type PlayerCharacterSelectionInput = z.infer<typeof PlayerCharacterSelectionSchema>;

/**
 * Step 3: Monster addition validation
 */
export const AddedMonsterSchema = z.object({
  monster_id: z.string().uuid(),
  name: z.string(),
  count: z.number().int().min(1).max(20),
});

export type AddedMonster = z.infer<typeof AddedMonsterSchema>;

/**
 * Step 4: Simple NPC Form validation
 */
export const SimpleNPCFormSchema = z.object({
  display_name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less")
    .trim(),
  max_hp: z.number().int().min(1, "Max HP must be at least 1"),
  armor_class: z.number().int().min(0, "AC must be at least 0"),
  initiative_modifier: z.number().int(),
});

export type SimpleNPCFormData = z.infer<typeof SimpleNPCFormSchema>;

/**
 * Step 4: Advanced NPC Form validation
 */
export const AdvancedNPCFormSchema = z.object({
  display_name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less")
    .trim(),
  max_hp: z.number().int().min(1, "Max HP must be at least 1"),
  armor_class: z.number().int().min(0, "AC must be at least 0"),
  speed: z.string().min(1, "Speed is required"),
  stats: CombatStatsSchema.refine(
    (stats) => {
      // All stats must be between 1 and 30
      return Object.values(stats).every((val) => val >= 1 && val <= 30);
    },
    {
      message: "All ability scores must be between 1 and 30",
    }
  ),
  actions: z.array(PlayerCharacterActionSchema).default([]),
});

export type AdvancedNPCFormData = z.infer<typeof AdvancedNPCFormSchema>;

/**
 * Ad-hoc NPC representation (after form submission)
 */
export const AdHocNPCSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string(),
  max_hp: z.number().int(),
  armor_class: z.number().int(),
  initiative_modifier: z.number().int().optional(),
  speed: z.string().optional(),
  stats: CombatStatsSchema,
  actions: z.array(PlayerCharacterActionSchema),
});

export type AdHocNPC = z.infer<typeof AdHocNPCSchema>;

/**
 * Step 5: Final validation before submitting
 */
export const WizardSummarySchema = z.object({
  combatName: z.string().min(1),
  selectedPlayerCharacterIds: z.array(z.string().uuid()),
  addedMonsters: z.array(AddedMonsterSchema),
  addedNPCs: z.array(AdHocNPCSchema),
});

export type WizardSummary = z.infer<typeof WizardSummarySchema>;
