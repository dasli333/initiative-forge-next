// Single participant in initiative list

import { useCallback, useState } from "react";
import { Skull, Plus } from "lucide-react";
import type { CombatParticipantDTO, ConditionDTO } from "@/types";
import { InitiativeBadge } from "./InitiativeBadge";
import { ACBadge } from "./ACBadge";
import { HPControls } from "./HPControls";
import { ConditionBadge } from "./ConditionBadge";
import { AddConditionDialog } from "./AddConditionDialog";
import { Button } from "@/components/ui/button";
import { useLanguageStore } from "@/stores/languageStore";

interface InitiativeItemProps {
  participant: CombatParticipantDTO;
  isActive: boolean;
  onUpdate: (updates: Partial<CombatParticipantDTO>) => void;
  onRemoveCondition: (conditionId: string) => void;
  onAddCondition: (conditionId: string, duration: number | null) => void;
  conditions: ConditionDTO[]; // Full conditions list for tooltips
}

export function InitiativeItem({
  participant,
  isActive,
  onUpdate,
  onRemoveCondition,
  onAddCondition,
  conditions,
}: InitiativeItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isUnconscious = participant.current_hp === 0;
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);

  // Get localized name or fallback to display_name
  const displayName = participant.display_name_localized?.[selectedLanguage] ?? participant.display_name;

  const handleHPChange = useCallback(
    (amount: number, type: "damage" | "heal") => {
      const delta = type === "damage" ? -amount : amount;
      const newHP = Math.max(0, Math.min(participant.max_hp, participant.current_hp + delta));
      onUpdate({ current_hp: newHP });
    },
    [participant.current_hp, participant.max_hp, onUpdate]
  );

  const baseClasses = "px-4 py-3 border-b transition-all duration-200 hover:bg-muted/30";
  const activeClasses = isActive ? "ring-2 ring-inset ring-emerald-500 bg-emerald-500/10" : "";
  const unconsciousClasses = isUnconscious ? "opacity-60" : "";

  return (
    <div className={`${baseClasses} ${activeClasses} ${unconsciousClasses}`}>
      <div className="space-y-3">
        {/* Header: Name + Initiative + AC */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold truncate ${isActive ? "text-base" : "text-sm"} ${isUnconscious ? "line-through" : ""}`}
            >
              {displayName}
              {isUnconscious && <Skull className="inline ml-1.5 h-3.5 w-3.5" />}
            </h3>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">{participant.source.replace(/_/g, " ")}</p>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <InitiativeBadge value={participant.initiative} />
            <ACBadge value={participant.armor_class} />
          </div>
        </div>

        {/* HP Controls with Progress Bar */}
        <HPControls currentHP={participant.current_hp} maxHP={participant.max_hp} onHPChange={handleHPChange} />

        {/* Add Condition Button */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => setIsDialogOpen(true)}
            disabled={isUnconscious}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Condition
          </Button>
        </div>

        {/* Active Conditions */}
        {participant.active_conditions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {participant.active_conditions.map((condition) => {
              const fullCondition = conditions.find((c) => c.id === condition.condition_id);
              if (!fullCondition) return null;

              return (
                <ConditionBadge
                  key={condition.condition_id}
                  condition={condition}
                  fullCondition={fullCondition}
                  onRemove={onRemoveCondition}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Add Condition Dialog */}
      <AddConditionDialog
        isOpen={isDialogOpen}
        participantName={displayName}
        conditions={conditions}
        existingConditionIds={participant.active_conditions.map((c) => c.condition_id)}
        onAdd={(conditionId, duration) => {
          onAddCondition(conditionId, duration);
          setIsDialogOpen(false);
        }}
        onCancel={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
