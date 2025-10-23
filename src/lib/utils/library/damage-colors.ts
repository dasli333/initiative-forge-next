/**
 * Utility functions for damage type colors
 * Used across monster and spell libraries for consistent damage type visualization
 */

/**
 * Gets Tailwind color classes for damage type badges based on D&D damage types
 *
 * @param damageType - The damage type (e.g., "Fire", "Cold", "Slashing")
 * @returns Tailwind classes for background, text, and border colors
 *
 * @example
 * ```tsx
 * <Badge className={getDamageTypeColor("Fire")}>
 *   Fire Damage
 * </Badge>
 * ```
 */
export function getDamageTypeColor(damageType?: string): string {
  if (!damageType) return "bg-red-500/10 text-red-500 border-red-500/20";

  const type = damageType.toLowerCase();

  // Elemental damage types
  if (type.includes("fire")) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  if (type.includes("cold") || type.includes("ice")) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  if (type.includes("lightning") || type.includes("thunder"))
    return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";

  // Nature/status damage types
  if (type.includes("poison") || type.includes("acid")) return "bg-green-500/10 text-green-500 border-green-500/20";
  if (type.includes("necrotic")) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
  if (type.includes("radiant")) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  if (type.includes("psychic")) return "bg-pink-500/10 text-pink-500 border-pink-500/20";

  // Default for physical damage (slashing, bludgeoning, piercing, force, etc.)
  return "bg-red-500/10 text-red-500 border-red-500/20";
}

/**
 * Gets color classes for resistance/immunity/vulnerability badges
 *
 * @param type - The defense type
 * @returns Tailwind classes for the badge
 */
export function getDefenseTypeColor(type: "vulnerability" | "resistance" | "immunity"): string {
  switch (type) {
    case "vulnerability":
      return "bg-red-500/10 text-red-400";
    case "resistance":
      return "bg-blue-500/10 text-blue-400";
    case "immunity":
      return "bg-emerald-500/10 text-emerald-400";
    default:
      return "bg-muted/50 text-foreground";
  }
}

/**
 * Gets color classes for condition immunity badges
 *
 * @returns Tailwind classes for condition immunity badges
 */
export function getConditionImmunityColor(): string {
  return "bg-purple-500/10 text-purple-400";
}
