import { z } from "zod";

/**
 * Multi-language name structure used across monsters and spells
 */
export const LocalizedNameSchema = z.object({
  en: z.string(),
  pl: z.string(),
});

export type LocalizedName = z.infer<typeof LocalizedNameSchema>;

/**
 * Damage structure used in monster actions, spells, and traits
 */
export const DamageSchema = z.object({
  average: z.number(),
  formula: z.string(),
  type: z.string().optional(), // "Bludgeoning", "Acid", etc. (monsters use "type")
  damageType: z.string().optional(), // Spells use "damageType"
});

export type Damage = z.infer<typeof DamageSchema>;

/**
 * Saving throw structure used in spells, monster abilities, and traits
 */
export const SavingThrowSchema = z.object({
  ability: z.string(), // "Constitution", "Dexterity", "Intelligence", etc.
  dc: z.number().optional(), // DC value (optional in spells where it's calculated)
  success: z.string().optional(), // "negates", "half", etc.
});

export type SavingThrow = z.infer<typeof SavingThrowSchema>;

/**
 * Attack roll structure used in monster actions
 */
export const AttackRollSchema = z.object({
  type: z.enum(["melee", "ranged"]),
  bonus: z.number(),
});

export type AttackRoll = z.infer<typeof AttackRollSchema>;

/**
 * Condition applied by attacks or abilities
 */
export const AppliedConditionSchema = z.object({
  name: z.string(), // "Grappled", "Charmed", etc.
  dc: z.number().optional(), // Escape DC if applicable
});

export type AppliedCondition = z.infer<typeof AppliedConditionSchema>;
