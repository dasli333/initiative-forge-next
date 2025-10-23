import { z } from "zod";

/**
 * Simplified action schema for player characters
 * This is a user-friendly version compatible with the monster action structure
 * but designed for manual entry by DMs
 */
export const PlayerCharacterActionSchema = z.object({
  name: z.string(), // "Longsword Attack", "Fireball", etc.
  type: z.string(), // "melee_weapon_attack", "ranged_weapon_attack", "spell", "special"
  attack_bonus: z.number().int().optional(), // For attack rolls
  reach: z.string().optional(), // "5 ft", "10 ft" (melee only)
  range: z.string().optional(), // "30/120 ft", "150 ft" (ranged only)
  damage_dice: z.string().optional(), // "1d8", "2d6", etc.
  damage_bonus: z.number().int().optional(), // Static damage modifier
  damage_type: z.string().optional(), // "slashing", "piercing", "fire", etc.
  description: z.string().optional(), // Optional description for special actions
});

export type PlayerCharacterAction = z.infer<typeof PlayerCharacterActionSchema>;

/**
 * Array of actions for a player character
 */
export const PlayerCharacterActionsSchema = z.array(PlayerCharacterActionSchema);

export type PlayerCharacterActions = z.infer<typeof PlayerCharacterActionsSchema>;
