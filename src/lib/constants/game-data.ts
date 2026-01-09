/**
 * D&D 5e game data constants
 * Central location for damage types, conditions, and other game rules
 */

export const DAMAGE_TYPES = [
  'Acid',
  'Bludgeoning',
  'Cold',
  'Fire',
  'Force',
  'Lightning',
  'Necrotic',
  'Piercing',
  'Poison',
  'Psychic',
  'Radiant',
  'Slashing',
  'Thunder',
] as const;

export const CONDITION_TYPES = [
  'Blinded',
  'Charmed',
  'Deafened',
  'Exhaustion',
  'Frightened',
  'Grappled',
  'Incapacitated',
  'Invisible',
  'Paralyzed',
  'Petrified',
  'Poisoned',
  'Prone',
  'Restrained',
  'Stunned',
  'Unconscious',
] as const;

export const ABILITIES = [
  'Strength',
  'Dexterity',
  'Constitution',
  'Intelligence',
  'Wisdom',
  'Charisma',
] as const;

export const SAVING_THROW_SUCCESS_OUTCOMES = [
  'negates',
  'half',
  'partial',
] as const;

// Type exports for convenience
export type DamageType = typeof DAMAGE_TYPES[number];
export type ConditionType = typeof CONDITION_TYPES[number];
export type Ability = typeof ABILITIES[number];
export type SavingThrowSuccessOutcome = typeof SAVING_THROW_SUCCESS_OUTCOMES[number];
