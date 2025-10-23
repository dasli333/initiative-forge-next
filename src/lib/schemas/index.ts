/**
 * Central export point for all Zod schemas and TypeScript types
 * Import from this file to access any schema or type throughout the application
 */

// Shared schemas
export {
  AppliedConditionSchema,
  AttackRollSchema,
  DamageSchema,
  LocalizedNameSchema,
  SavingThrowSchema,
  type AppliedCondition,
  type AttackRoll,
  type Damage,
  type LocalizedName,
  type SavingThrow,
} from "./shared.schema";

// Condition schemas
export {
  ConditionSchema,
  ListConditionsResponseSchema,
  type Condition,
  type ListConditionsResponse,
} from "./condition.schema";

// Monster schemas
export {
  AbilityScoreSchema,
  AbilityScoresSchema,
  ChallengeRatingSchema,
  HealingSchema,
  HitPointsSchema,
  InitiativeSchema,
  LegendaryActionsSchema,
  ListMonstersQuerySchema,
  MonsterActionSchema,
  MonsterDataSchema,
  MonsterSchema,
  MonsterTraitSchema,
  type AbilityScore,
  type AbilityScores,
  type ChallengeRating,
  type Healing,
  type HitPoints,
  type Initiative,
  type LegendaryActions,
  type ListMonstersQuery,
  type Monster,
  type MonsterAction,
  type MonsterData,
  type MonsterTrait,
} from "./monster.schema";

// Spell schemas
export {
  CastingTimeSchema,
  ComponentsSchema,
  DurationSchema,
  SpellDataSchema,
  SpellSchema,
  type CastingTime,
  type Components,
  type Duration,
  type Spell,
  type SpellData,
} from "./spell.schema";

// Player character action schemas
export {
  PlayerCharacterActionSchema,
  PlayerCharacterActionsSchema,
  type PlayerCharacterAction,
  type PlayerCharacterActions,
} from "./action.schema";

// Combat schemas
export {
  ActiveConditionSchema,
  CombatParticipantSchema,
  CombatSchema,
  CombatSnapshotSchema,
  CombatStatsSchema,
  InitialParticipantSchema,
  type ActiveCondition,
  type Combat,
  type CombatParticipant,
  type CombatSnapshot,
  type CombatStats,
  type InitialParticipant,
} from "./combat.schema";

// Player character schemas
export { CreatePlayerCharacterCommandSchema, type CreatePlayerCharacterCommand } from "./player-character.schema";
