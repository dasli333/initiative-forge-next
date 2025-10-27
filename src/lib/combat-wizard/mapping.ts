import type {
  AdHocNPC,
  AddedMonster,
  AdvancedNPCFormData,
  CombatStats,
  SimpleNPCFormData,
} from "@/lib/schemas";
import type { CreateCombatCommand, InitialParticipant } from "@/types";

/**
 * Converts Simple NPC form data to AdHocNPC
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
 * Converts Advanced NPC form data to AdHocNPC
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

/**
 * Maps wizard state to CreateCombatCommand for API submission
 */
export function mapWizardStateToCommand(wizardState: {
  combatName: string;
  selectedPlayerCharacterIds: string[];
  addedMonsters: Map<string, AddedMonster>;
  addedNPCs: AdHocNPC[];
}): CreateCombatCommand {
  const initial_participants: InitialParticipant[] = [];

  // 1. Add selected player characters
  wizardState.selectedPlayerCharacterIds.forEach((pcId) => {
    initial_participants.push({
      source: "player_character",
      player_character_id: pcId,
    });
  });

  // 2. Add monsters
  wizardState.addedMonsters.forEach((monsterData, monsterId) => {
    initial_participants.push({
      source: "monster",
      monster_id: monsterId,
      count: monsterData.count,
    });
  });

  // 3. Add NPCs
  wizardState.addedNPCs.forEach((npc) => {
    let stats: CombatStats = npc.stats;

    // If Simple Mode (has initiative_modifier but no speed), calculate DEX from initiative_modifier
    if (npc.initiative_modifier !== undefined && !npc.speed) {
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
