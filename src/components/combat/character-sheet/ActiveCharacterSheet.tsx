// Active character sheet (middle column)

import type { CombatParticipantDTO, ActionDTO } from "@/types";
import type { MonsterAction } from "@/lib/schemas/monster.schema";
import { CharacterHeader } from "./CharacterHeader";
import { StatsGrid } from "./StatsGrid";
import { CombatProperties } from "./CombatProperties";
import { DescriptiveAbilities } from "./DescriptiveAbilities";
import { GradientSeparator, SectionHeader } from "@/components/library";
import { Dumbbell, Shield } from "lucide-react";

interface ActiveCharacterSheetProps {
  participant: CombatParticipantDTO | null;
  onActionClick: (action: ActionDTO) => void;
}

export function ActiveCharacterSheet({ participant, onActionClick }: ActiveCharacterSheetProps) {
  if (!participant) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-8">
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold">No Active Character</p>
          <p className="text-sm">Roll initiative to start combat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-w-0">
      {/* Character Header - Fixed */}
      <div className="flex-shrink-0 min-w-0">
        <CharacterHeader
          name={participant.display_name}
          currentHP={participant.current_hp}
          maxHP={participant.max_hp}
          armorClass={participant.armor_class}
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <section className="overflow-hidden">
            <SectionHeader icon={Dumbbell} title="Ability Scores" />
            <StatsGrid stats={participant.stats} />
          </section>

          {/* Combat Properties */}
          {(participant.damageVulnerabilities ||
            participant.damageResistances ||
            participant.damageImmunities ||
            participant.conditionImmunities ||
            participant.gear) && (
            <>
              <GradientSeparator />
              <section className="overflow-hidden">
                <SectionHeader icon={Shield} title="Combat Properties" />
                <CombatProperties
                  damageVulnerabilities={participant.damageVulnerabilities}
                  damageResistances={participant.damageResistances}
                  damageImmunities={participant.damageImmunities}
                  conditionImmunities={participant.conditionImmunities}
                  gear={participant.gear}
                />
              </section>
            </>
          )}

          {/* Abilities - All traits, actions, bonus actions, reactions, legendary actions */}
          {(participant.traits ||
            participant.actions ||
            participant.bonusActions ||
            participant.reactions ||
            participant.legendaryActions) && (
            <>
              <GradientSeparator />
              <section className="overflow-hidden">
                <DescriptiveAbilities
                  traits={participant.traits}
                  actions={participant.actions as MonsterAction[]}
                  bonusActions={participant.bonusActions}
                  reactions={participant.reactions}
                  legendaryActions={participant.legendaryActions}
                  onActionClick={onActionClick}
                />
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
