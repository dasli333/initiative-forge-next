// Dice rolling utilities for D&D 5e combat
// Handles dice rolls, modifiers, advantage/disadvantage, and attack execution

import type { ActionDTO } from "@/types";
import type { RollMode, RollResult } from "@/types/combat-view.types";

/**
 * Roll dice with specified count and sides
 * @param count Number of dice to roll
 * @param sides Number of sides on each die
 * @returns Array of individual roll results
 */
export function rollDice(count: number, sides: number): number[] {
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  return rolls;
}

/**
 * Calculate ability modifier from ability score
 * Formula: floor((score - 10) / 2)
 * @param score Ability score (1-30)
 * @returns Modifier (-5 to +10)
 */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Roll a d20 with advantage/disadvantage support
 * @param mode Roll mode: normal, advantage, or disadvantage
 * @param modifier Bonus/penalty to add to the roll
 * @returns Object with rolls array, final result, and crit/fail flags
 */
export function rollD20(
  mode: RollMode,
  modifier: number
): {
  rolls: number[];
  result: number;
  isCrit: boolean;
  isFail: boolean;
} {
  let rolls: number[];

  if (mode === "advantage" || mode === "disadvantage") {
    // Roll 2d20
    rolls = rollDice(2, 20);

    // Select higher (advantage) or lower (disadvantage)
    const selected = mode === "advantage" ? Math.max(...rolls) : Math.min(...rolls);

    // Check for natural 20 or 1 (only the selected die counts)
    const isCrit = selected === 20;
    const isFail = selected === 1;

    return {
      rolls,
      result: selected + modifier,
      isCrit,
      isFail,
    };
  }

  // Normal roll
  rolls = rollDice(1, 20);
  const isCrit = rolls[0] === 20;
  const isFail = rolls[0] === 1;

  return {
    rolls,
    result: rolls[0] + modifier,
    isCrit,
    isFail,
  };
}

/**
 * Parse damage dice formula and roll
 * Supports formats like "1d8+3", "2d6", "1d10 + 5", "1d6 - 2" (with or without spaces)
 * @param formula Damage dice formula
 * @returns Object with rolls, total, and formula
 */
export function rollDamage(formula: string): {
  rolls: number[];
  total: number;
  formula: string;
} {
  // Parse formula like "1d8+3", "2d6", "1d10 + 5", or "1d6 - 2" (ignoring spaces)
  const match = formula.match(/(\d+)d(\d+)\s*([+-]\s*\d+)?/);

  if (!match) {
    // Invalid formula, return 0
    return { rolls: [], total: 0, formula };
  }

  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  // Remove spaces from modifier before parsing
  const bonus = match[3] ? parseInt(match[3].replace(/\s/g, ""), 10) : 0;

  const rolls = rollDice(count, sides);
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + bonus;

  return {
    rolls,
    total,
    formula,
  };
}

/**
 * Execute an attack action with attack roll and damage
 * @param action Action to execute
 * @param mode Roll mode for the attack roll
 * @returns Attack and damage roll results (supports multiple damage types)
 */
export function executeAttack(
  action: ActionDTO,
  mode: RollMode
): {
  attack: {
    rolls: number[];
    result: number;
    isCrit: boolean;
    isFail: boolean;
  } | null;
  damage: {
    rolls: number[];
    total: number;
    formula: string;
    type: string;
  }[];
} {
  // Roll attack only if action has attackRoll
  let attack: {
    rolls: number[];
    result: number;
    isCrit: boolean;
    isFail: boolean;
  } | null = null;

  if (action.attackRoll) {
    attack = rollD20(mode, action.attackRoll.bonus);
  }

  // Roll damage for each damage type
  const damageResults: {
    rolls: number[];
    total: number;
    formula: string;
    type: string;
  }[] = [];

  if (action.damage && action.damage.length > 0) {
    // Use new damage array (supports multiple damage types)
    for (const dmg of action.damage) {
      const damageResult = rollDamage(dmg.formula);

      // Double damage dice on crit (but not the bonus)
      if (attack && attack.isCrit) {
        // Parse formula to extract dice count and sides
        const match = dmg.formula.match(/(\d+)d(\d+)/);
        if (match) {
          const count = parseInt(match[1], 10);
          const sides = parseInt(match[2], 10);

          // Roll additional dice for crit
          const critRolls = rollDice(count, sides);
          damageResult.rolls = [...damageResult.rolls, ...critRolls];

          // Recalculate total (all dice + original bonus, ignoring spaces)
          const diceTotal = damageResult.rolls.reduce((sum, roll) => sum + roll, 0);
          const bonusMatch = dmg.formula.match(/([+-]\s*\d+)/);
          const bonus = bonusMatch ? parseInt(bonusMatch[1].replace(/\s/g, ""), 10) : 0;
          damageResult.total = diceTotal + bonus;
        }
      }

      damageResults.push({
        ...damageResult,
        type: dmg.type || '',
      });
    }
  }

  return {
    attack,
    damage: damageResults,
  };
}

/**
 * Format roll result for display
 * @param rolls Array of individual die rolls
 * @param modifier Modifier applied
 * @returns Formatted string like "12, 18 (+5) = 23"
 */
export function formatRollResult(rolls: number[], modifier: number): string {
  const rollsStr = rolls.join(", ");
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
  return `${rollsStr} (${modStr}) = ${total}`;
}

/**
 * Create RollResult object from attack execution
 * @param action Action that was executed
 * @param attackResult Attack roll result
 * @param damageResults Damage roll results (array supporting multiple damage types)
 * @returns Array of RollResult objects (attack + damage for each type)
 */
export function createRollResults(
  action: ActionDTO,
  attackResult: ReturnType<typeof executeAttack>["attack"],
  damageResults: ReturnType<typeof executeAttack>["damage"]
): RollResult[] {
  const results: RollResult[] = [];

  // Attack roll result (only if action has attackRoll)
  if (attackResult && action.attackRoll) {
    const attackBonus = action.attackRoll.bonus;
    const attackFormula = `1d20${attackBonus >= 0 ? "+" : ""}${attackBonus}`;

    results.push({
      id: crypto.randomUUID(),
      type: "attack",
      result: attackResult.result,
      formula: attackFormula,
      rolls: attackResult.rolls,
      modifier: attackBonus,
      timestamp: new Date(),
      isCrit: attackResult.isCrit,
      isFail: attackResult.isFail,
      actionName: action.name,
    });
  }

  // Damage roll results (one for each damage type)
  if (damageResults && damageResults.length > 0) {
    for (const dmg of damageResults) {
      // Extract modifier from formula (supports both "+4" and "- 2" with optional spaces)
      const modifierMatch = dmg.formula.match(/([+-]\s*\d+)\s*$/);
      const modifier = modifierMatch ? parseInt(modifierMatch[1].replace(/\s/g, ""), 10) : 0;

      results.push({
        id: crypto.randomUUID(),
        type: "damage",
        result: dmg.total,
        formula: dmg.formula,
        rolls: dmg.rolls,
        modifier: modifier,
        timestamp: new Date(),
        actionName: action.name,
        damageType: dmg.type,
      });
    }
  }

  return results;
}
