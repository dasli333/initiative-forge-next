/**
 * Formatting utilities for library components
 * Used across monster and spell libraries for consistent number and text formatting
 */

/**
 * Formats ability modifier with + or - sign
 *
 * @param modifier - The numeric modifier value
 * @returns Formatted string with sign (e.g., "+3", "-2", "+0")
 *
 * @example
 * ```tsx
 * formatModifier(3)  // "+3"
 * formatModifier(-2) // "-2"
 * formatModifier(0)  // "+0"
 * ```
 */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : String(modifier);
}

/**
 * Formats a bonus value with + sign (similar to formatModifier but clearer name for bonuses)
 *
 * @param bonus - The numeric bonus value
 * @returns Formatted string with + sign
 *
 * @example
 * ```tsx
 * formatBonus(5)  // "+5"
 * formatBonus(10) // "+10"
 * ```
 */
export function formatBonus(bonus: number): string {
  return `+${bonus}`;
}

/**
 * Formats dice formula with average value
 *
 * @param average - Average damage/healing value
 * @param formula - Dice formula (e.g., "2d6+3")
 * @returns Formatted string (e.g., "11 (2d6+3)")
 *
 * @example
 * ```tsx
 * formatDiceWithAverage(11, "2d6+3") // "11 (2d6+3)"
 * ```
 */
export function formatDiceWithAverage(average: number, formula: string): string {
  return `${average} (${formula})`;
}

/**
 * Formats a spell or ability save DC
 *
 * @param dc - The difficulty class value
 * @returns Formatted string (e.g., "DC 15")
 *
 * @example
 * ```tsx
 * formatDC(15) // "DC 15"
 * ```
 */
export function formatDC(dc: number): string {
  return `DC ${dc}`;
}
