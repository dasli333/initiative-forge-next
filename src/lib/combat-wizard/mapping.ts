import type { AddedMonster } from "@/lib/schemas";
import type { CreateCombatCommand, InitialParticipantCommand } from "@/types";

/**
 * Maps wizard state to CreateCombatCommand for API submission
 */
export function mapWizardStateToCommand(wizardState: {
  combatName: string;
  selectedPlayerCharacterIds: string[];
  addedMonsters: Map<string, AddedMonster>;
  selectedNPCIds: string[];
}): CreateCombatCommand {
  const initial_participants: InitialParticipantCommand[] = [];

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

  // 3. Add selected NPCs (existing NPCs from campaign)
  wizardState.selectedNPCIds.forEach((npcId) => {
    initial_participants.push({
      source: "npc",
      npc_id: npcId,
    });
  });

  return {
    name: wizardState.combatName,
    initial_participants: initial_participants,
  };
}
