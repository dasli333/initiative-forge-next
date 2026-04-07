import type { MonsterDTO, CombatParticipantDTO } from "@/types";
import { mapMonsterActions } from "@/lib/api/combats";

/**
 * Client-side conversion of MonsterDTO to CombatParticipantDTO[].
 * Handles smart numbering based on existing participants of the same monster type.
 */
export function createMonsterParticipants(
  monster: MonsterDTO,
  count: number,
  existingParticipants: CombatParticipantDTO[]
): CombatParticipantDTO[] {
  const monsterData = monster.data;

  // Find existing participants from the same monster
  const existing = existingParticipants.filter((p) => p.monster_id === monster.id);

  // Extract highest #N suffix from existing
  const maxNumber = existing.reduce((max, p) => {
    const match = p.display_name.match(/#(\d+)$/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);

  const needsNumbering = count > 1 || existing.length > 0;
  const startIndex = maxNumber > 0 ? maxNumber + 1 : existing.length + 1;

  const participants: CombatParticipantDTO[] = [];
  for (let i = 0; i < count; i++) {
    const num = startIndex + i;
    const displayName = needsNumbering
      ? `${monsterData.name.pl} #${num}`
      : monsterData.name.pl;
    const displayNameLocalized = needsNumbering
      ? { en: `${monsterData.name.en} #${num}`, pl: `${monsterData.name.pl} #${num}` }
      : { en: monsterData.name.en, pl: monsterData.name.pl };

    participants.push({
      id: crypto.randomUUID(),
      source: "monster",
      monster_id: monster.id,
      display_name: displayName,
      display_name_localized: displayNameLocalized,
      initiative: null,
      current_hp: monsterData.hitPoints.average,
      max_hp: monsterData.hitPoints.average,
      armor_class: monsterData.armorClass,
      stats: {
        str: monsterData.abilityScores.strength.score,
        dex: monsterData.abilityScores.dexterity.score,
        con: monsterData.abilityScores.constitution.score,
        int: monsterData.abilityScores.intelligence.score,
        wis: monsterData.abilityScores.wisdom.score,
        cha: monsterData.abilityScores.charisma.score,
      },
      actions: mapMonsterActions(monsterData.actions),
      damageVulnerabilities:
        monsterData.damageVulnerabilities?.length > 0 ? monsterData.damageVulnerabilities : undefined,
      damageResistances:
        monsterData.damageResistances?.length > 0 ? monsterData.damageResistances : undefined,
      damageImmunities:
        monsterData.damageImmunities?.length > 0 ? monsterData.damageImmunities : undefined,
      conditionImmunities:
        monsterData.conditionImmunities?.length > 0 ? monsterData.conditionImmunities : undefined,
      gear: monsterData.gear?.length > 0 ? monsterData.gear : undefined,
      traits: monsterData.traits?.length > 0 ? monsterData.traits : undefined,
      bonusActions: monsterData.bonusActions?.length > 0 ? monsterData.bonusActions : undefined,
      reactions: monsterData.reactions?.length > 0 ? monsterData.reactions : undefined,
      legendaryActions: monsterData.legendaryActions,
      is_ally: false,
      is_active_turn: false,
      active_conditions: [],
    });
  }

  return participants;
}
