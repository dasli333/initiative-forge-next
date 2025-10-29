// Utility functions for character sheet components

import type { ActionDTO } from "@/types";
import type { MonsterAction, MonsterTrait } from "@/lib/schemas/monster.schema";

/**
 * Checks if an ActionDTO has rollable dice (attack roll or damage)
 */
export function isRollableAction(action: ActionDTO): boolean {
  return !!(action.attackRoll || (action.damage && action.damage.length > 0));
}

/**
 * Checks if a MonsterAction has rollable dice (attack roll or damage)
 */
export function isRollableMonsterAction(action: MonsterAction): boolean {
  return !!(action.attackRoll || (action.damage && action.damage.length > 0));
}

/**
 * Checks if a MonsterTrait has rollable dice (damage)
 */
export function isRollableTrait(trait: MonsterTrait): boolean {
  return !!(trait.damage && trait.damage.length > 0);
}

/**
 * Converts a MonsterAction to ActionDTO format for clickable buttons
 */
export function convertMonsterActionToActionDTO(action: MonsterAction, actionType?: string): ActionDTO {
  return {
    name: action.name,
    type: actionType || action.type || "action",
    attack_bonus: action.attackRoll?.bonus,
    range: (action as unknown as { range?: string }).range, // MonsterAction schema doesn't include range, but it may exist in data
    damage_dice: action.damage?.[0]?.formula,
    damage_type: action.damage?.[0]?.type,
    description: action.description,
    attackRoll: action.attackRoll,
    damage: action.damage,
  };
}

/**
 * Converts a MonsterTrait to ActionDTO format for clickable buttons
 */
export function convertMonsterTraitToActionDTO(trait: MonsterTrait): ActionDTO {
  return {
    name: trait.name,
    type: "trait",
    description: trait.description,
    damage: trait.damage,
  };
}
