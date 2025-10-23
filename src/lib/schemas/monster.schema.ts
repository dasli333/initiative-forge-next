import { z } from "zod";

import {
  AppliedConditionSchema,
  AttackRollSchema,
  DamageSchema,
  LocalizedNameSchema,
  SavingThrowSchema,
} from "./shared.schema";

/**
 * Single ability score with modifier and saving throw bonus
 */
export const AbilityScoreSchema = z.object({
  score: z.number().int().min(1).max(30),
  modifier: z.number().int(),
  save: z.number().int(),
});

export type AbilityScore = z.infer<typeof AbilityScoreSchema>;

/**
 * All six ability scores for a monster
 */
export const AbilityScoresSchema = z.object({
  strength: AbilityScoreSchema,
  dexterity: AbilityScoreSchema,
  constitution: AbilityScoreSchema,
  intelligence: AbilityScoreSchema,
  wisdom: AbilityScoreSchema,
  charisma: AbilityScoreSchema,
});

export type AbilityScores = z.infer<typeof AbilityScoresSchema>;

/**
 * Hit points with average value and dice formula
 */
export const HitPointsSchema = z.object({
  average: z.number().int(),
  formula: z.string(),
});

export type HitPoints = z.infer<typeof HitPointsSchema>;

/**
 * Challenge Rating information
 */
export const ChallengeRatingSchema = z.object({
  rating: z.string(), // "1/4", "1/2", "1", "10", etc.
  experiencePoints: z.number().int(),
  proficiencyBonus: z.number().int(),
});

export type ChallengeRating = z.infer<typeof ChallengeRatingSchema>;

/**
 * Monster trait (special abilities, passives)
 */
export const MonsterTraitSchema = z.object({
  name: z.string(),
  description: z.string(),
  type: z.string(), // "special", etc.
  savingThrow: SavingThrowSchema.optional(),
  damage: z.array(DamageSchema).optional(),
});

export type MonsterTrait = z.infer<typeof MonsterTraitSchema>;

/**
 * Healing structure for monster actions
 */
export const HealingSchema = z.object({
  average: z.number(),
  formula: z.string(),
});

export type Healing = z.infer<typeof HealingSchema>;

/**
 * Monster action (attacks, special actions, bonus actions, reactions)
 */
export const MonsterActionSchema = z.object({
  name: z.string(),
  description: z.string(),
  type: z.string(), // "multiattack", "melee", "ranged", "special", etc.
  attackRoll: AttackRollSchema.optional(),
  damage: z.array(DamageSchema).optional(),
  savingThrow: SavingThrowSchema.optional(),
  conditions: z.array(AppliedConditionSchema).optional(),
  healing: HealingSchema.optional(),
});

export type MonsterAction = z.infer<typeof MonsterActionSchema>;

/**
 * Initiative information
 */
export const InitiativeSchema = z.object({
  modifier: z.number().int(),
  total: z.number().int(),
});

export type Initiative = z.infer<typeof InitiativeSchema>;

/**
 * Legendary actions structure (for legendary monsters)
 */
export const LegendaryActionsSchema = z.object({
  uses: z.number().int(),
  usesInLair: z.number().int().optional(),
  usageDescription: z.string(),
  actions: z.array(MonsterActionSchema),
});

export type LegendaryActions = z.infer<typeof LegendaryActionsSchema>;

/**
 * Full monster data structure stored in the monsters.data JSONB column
 */
export const MonsterDataSchema = z.object({
  // Localized name (stored in jsonb for i18n support)
  name: LocalizedNameSchema,

  // Basic info
  size: z.string(), // "Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"
  type: z.string(), // "Aberration", "Beast", "Humanoid", etc.
  category: z.string(),
  alignment: z.string(),

  // Senses and languages
  senses: z.array(z.string()),
  languages: z.array(z.string()),

  // Ability scores
  abilityScores: AbilityScoresSchema,

  // Combat stats
  speed: z.array(z.string()), // ["10 ft.", "swim 40 ft."]
  hitPoints: HitPointsSchema,
  armorClass: z.number().int(),
  challengeRating: ChallengeRatingSchema,

  // Skills and proficiencies
  skills: z.array(z.string()),

  // Resistances and immunities
  damageVulnerabilities: z.array(z.string()),
  damageResistances: z.array(z.string()),
  damageImmunities: z.array(z.string()),
  conditionImmunities: z.array(z.string()),

  // Equipment (not used in MVP but present in data)
  gear: z.array(z.string()),

  // Abilities and actions
  traits: z.array(MonsterTraitSchema),
  actions: z.array(MonsterActionSchema),
  bonusActions: z.array(MonsterActionSchema),
  reactions: z.array(MonsterActionSchema),

  // Initiative
  initiative: InitiativeSchema,

  // Legendary actions (optional, present in legendary monsters)
  legendaryActions: LegendaryActionsSchema.optional(),

  // Unique identifier
  id: z.string(),
});

export type MonsterData = z.infer<typeof MonsterDataSchema>;

/**
 * Complete monster entity as stored in database
 */
export const MonsterSchema = z.object({
  id: z.string().uuid(),
  name: z.string(), // English name extracted for indexing/search (from data.name.en)
  data: MonsterDataSchema, // JSONB column containing full monster data including localized names
  created_at: z.string().datetime(),
});

export type Monster = z.infer<typeof MonsterSchema>;

/**
 * Schema for validating query parameters in GET /api/monsters
 * Supports filtering by name, type, size, alignment, and pagination
 */
export const ListMonstersQuerySchema = z.object({
  name: z.string().max(255, "Name must be 255 characters or less").trim().optional(),

  type: z.string().max(100, "Type must be 100 characters or less").trim().optional(),

  size: z.string().max(50, "Size must be 50 characters or less").trim().optional(),

  alignment: z.string().max(100, "Alignment must be 100 characters or less").trim().optional(),

  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(20),

  offset: z.coerce.number().int().nonnegative("Offset must be non-negative").default(0),
});

export type ListMonstersQuery = z.infer<typeof ListMonstersQuerySchema>;
