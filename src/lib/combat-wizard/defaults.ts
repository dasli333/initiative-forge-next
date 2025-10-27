import type { SimpleNPCFormData, AdvancedNPCFormData } from "@/lib/schemas";

/**
 * Default values for Simple NPC Form
 */
export function defaultSimpleNPCFormData(): SimpleNPCFormData {
  return {
    display_name: "",
    max_hp: 1,
    armor_class: 10,
    initiative_modifier: 0,
  };
}

/**
 * Default values for Advanced NPC Form
 */
export function defaultAdvancedNPCFormData(): AdvancedNPCFormData {
  return {
    display_name: "",
    max_hp: 1,
    armor_class: 10,
    speed: "30 ft",
    stats: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
    },
    actions: [],
  };
}

/**
 * Generates default combat name with current date and time
 * Format: "Combat - Oct 14, 2025 14:30"
 */
export function generateDefaultCombatName(): string {
  const now = new Date();
  return `Combat - ${now.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
