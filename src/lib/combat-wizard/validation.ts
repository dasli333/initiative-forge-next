import {
  AdvancedNPCFormSchema,
  CombatNameSchema,
  PlayerCharacterSelectionSchema,
  SimpleNPCFormSchema,
} from "@/lib/schemas";
import type { SimpleNPCFormData, AdvancedNPCFormData, AdHocNPC, AddedMonster } from "@/lib/schemas";

/**
 * Validates Step 1 (Combat Name)
 * Uses Zod schema for validation
 */
export function validateStep1(combatName: string): {
  valid: boolean;
  error?: string;
} {
  const result = CombatNameSchema.safeParse({ combatName });

  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues[0]?.message || "Invalid combat name",
    };
  }

  return { valid: true };
}

/**
 * Validates Step 2 (Select Player Characters)
 * Uses Zod schema for validation
 */
export function validateStep2(selectedIds: string[]): {
  valid: boolean;
  error?: string;
} {
  const result = PlayerCharacterSelectionSchema.safeParse({
    selectedPlayerCharacterIds: selectedIds,
  });

  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues[0]?.message || "Invalid player character selection",
    };
  }

  return { valid: true };
}

/**
 * Validates Step 5 (before final submission)
 * Ensures at least one participant is present
 */
export function validateStep5(
  selectedPlayerCharacterIds: string[],
  addedMonsters: Map<string, AddedMonster>,
  addedNPCs: AdHocNPC[]
): {
  valid: boolean;
  error?: string;
} {
  const hasParticipants = selectedPlayerCharacterIds.length > 0 || addedMonsters.size > 0 || addedNPCs.length > 0;

  if (!hasParticipants) {
    return {
      valid: false,
      error: "Please add at least one participant to the combat",
    };
  }

  return { valid: true };
}

/**
 * Validates Simple NPC form data
 * Uses Zod schema for validation
 */
export function validateSimpleNPCForm(form: SimpleNPCFormData): {
  valid: boolean;
  errors: Partial<Record<keyof SimpleNPCFormData, string>>;
} {
  const result = SimpleNPCFormSchema.safeParse(form);

  if (!result.success) {
    const errors: Partial<Record<keyof SimpleNPCFormData, string>> = {};
    result.error.issues.forEach((err) => {
      const path = err.path[0] as keyof SimpleNPCFormData;
      if (path) {
        errors[path] = err.message;
      }
    });

    return { valid: false, errors };
  }

  return { valid: true, errors: {} };
}

/**
 * Validates Advanced NPC form data
 * Uses Zod schema for validation
 */
export function validateAdvancedNPCForm(form: AdvancedNPCFormData): {
  valid: boolean;
  errors: Partial<Record<string, string>>;
} {
  const result = AdvancedNPCFormSchema.safeParse(form);

  if (!result.success) {
    const errors: Partial<Record<string, string>> = {};
    result.error.issues.forEach((err) => {
      const path = err.path.join(".");
      if (path) {
        errors[path] = err.message;
      }
    });

    return { valid: false, errors };
  }

  return { valid: true, errors: {} };
}
