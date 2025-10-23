// Utility functions for Combat Creation Wizard

import type {
  WizardState,
  SimpleNPCFormData,
  AdvancedNPCFormData,
  AdHocNPC,
  AddedMonsterViewModel,
  PlayerCharacterDTO,
  MonsterDTO,
  CreateCombatCommand,
  InitialParticipantCommand,
  StatsDTO,
} from "./types";

/**
 * Funkcja mapująca stan wizardu na CreateCombatCommand
 */
export function mapWizardStateToCommand(wizardState: WizardState): CreateCombatCommand {
  const initial_participants: InitialParticipantCommand[] = [];

  // 1. Dodaj wybrane postacie graczy
  wizardState.selectedPlayerCharacterIds.forEach((pcId) => {
    initial_participants.push({
      source: "player_character",
      player_character_id: pcId,
    });
  });

  // 2. Dodaj potwory
  wizardState.addedMonsters.forEach((monsterData, monsterId) => {
    initial_participants.push({
      source: "monster",
      monster_id: monsterId,
      count: monsterData.count,
    });
  });

  // 3. Dodaj NPCe
  wizardState.addedNPCs.forEach((npc) => {
    // Przekształć AdHocNPC na format API
    let stats: StatsDTO = npc.stats;

    // Jeśli Simple Mode, oblicz stats na podstawie initiative_modifier
    // lub użyj domyślnych wartości
    if (npc.initiative_modifier !== undefined && !npc.speed) {
      // Simple Mode - oblicz DEX na podstawie initiative_modifier
      // DEX modifier = initiative_modifier
      // DEX score ≈ 10 + (modifier * 2)
      stats = {
        ...stats,
        dex: 10 + npc.initiative_modifier * 2,
      };
    }

    initial_participants.push({
      source: "ad_hoc_npc",
      display_name: npc.display_name,
      max_hp: npc.max_hp,
      armor_class: npc.armor_class,
      stats: stats,
      actions: npc.actions || [],
    });
  });

  return {
    name: wizardState.combatName,
    initial_participants: initial_participants,
  };
}

/**
 * Generuje domyślną nazwę dla walki
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

/**
 * Walidacja Step 1 (Combat Name)
 */
export function validateStep1(combatName: string): {
  valid: boolean;
  error?: string;
} {
  if (combatName.trim().length === 0) {
    return { valid: false, error: "Combat name is required" };
  }

  if (combatName.length > 255) {
    return { valid: false, error: "Combat name must be 255 characters or less" };
  }

  return { valid: true };
}

/**
 * Walidacja Step 2 (Select Player Characters)
 */
export function validateStep2(selectedIds: string[]): {
  valid: boolean;
  error?: string;
} {
  if (selectedIds.length === 0) {
    return { valid: false, error: "Please select at least one player character" };
  }

  return { valid: true };
}

/**
 * Walidacja Step 5 (przed submit)
 */
export function validateStep5(
  selectedPlayerCharacterIds: string[],
  addedMonsters: Map<string, AddedMonsterViewModel>,
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
 * Walidacja Simple NPC Form
 */
export function validateSimpleNPCForm(form: SimpleNPCFormData): {
  valid: boolean;
  errors: Partial<Record<keyof SimpleNPCFormData, string>>;
} {
  const errors: Partial<Record<keyof SimpleNPCFormData, string>> = {};

  if (form.display_name.trim().length === 0) {
    errors.display_name = "Name is required";
  } else if (form.display_name.length > 255) {
    errors.display_name = "Name must be 255 characters or less";
  }

  if (form.max_hp < 1) {
    errors.max_hp = "Max HP must be at least 1";
  }

  if (form.armor_class < 0) {
    errors.armor_class = "AC must be at least 0";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Walidacja Advanced NPC Form
 */
export function validateAdvancedNPCForm(form: AdvancedNPCFormData): {
  valid: boolean;
  errors: Partial<Record<keyof AdvancedNPCFormData | string, string>>;
} {
  const errors: Partial<Record<string, string>> = {};

  // Basic fields (same as Simple Mode)
  if (form.display_name.trim().length === 0) {
    errors.display_name = "Name is required";
  } else if (form.display_name.length > 255) {
    errors.display_name = "Name must be 255 characters or less";
  }

  if (form.max_hp < 1) {
    errors.max_hp = "Max HP must be at least 1";
  }

  if (form.armor_class < 0) {
    errors.armor_class = "AC must be at least 0";
  }

  // Speed
  if (form.speed.trim().length === 0) {
    errors.speed = "Speed is required";
  }

  // Stats validation (each must be 1-30)
  const statNames = ["str", "dex", "con", "int", "wis", "cha"] as const;
  for (const stat of statNames) {
    const value = form.stats[stat];
    if (value < 1 || value > 30) {
      errors[`stats.${stat}`] = `${stat.toUpperCase()} must be between 1 and 30`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Domyślne dane dla Simple NPC Form
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
 * Domyślne dane dla Advanced NPC Form
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
 * Konwersja Simple NPC Form do AdHocNPC
 */
export function simpleFormToAdHocNPC(form: SimpleNPCFormData): AdHocNPC {
  return {
    id: crypto.randomUUID(),
    display_name: form.display_name,
    max_hp: form.max_hp,
    armor_class: form.armor_class,
    initiative_modifier: form.initiative_modifier,
    stats: {
      str: 10,
      dex: 10 + (form.initiative_modifier || 0) * 2,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
    },
    actions: [],
  };
}

/**
 * Konwersja Advanced NPC Form do AdHocNPC
 */
export function advancedFormToAdHocNPC(form: AdvancedNPCFormData): AdHocNPC {
  return {
    id: crypto.randomUUID(),
    display_name: form.display_name,
    max_hp: form.max_hp,
    armor_class: form.armor_class,
    speed: form.speed,
    stats: form.stats,
    actions: form.actions,
  };
}
