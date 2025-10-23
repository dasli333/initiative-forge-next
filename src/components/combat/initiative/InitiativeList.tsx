// Initiative list (left column)

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CombatParticipantDTO, ConditionDTO } from "@/types";
import { CombatControlBar } from "../CombatControlBar";
import { InitiativeItem } from "./InitiativeItem";

interface InitiativeListProps {
  participants: CombatParticipantDTO[];
  currentRound: number;
  activeParticipantIndex: number | null;
  onRollInitiative: () => void;
  onStartCombat: () => void;
  onNextTurn: () => void;
  onSave: () => void;
  isDirty: boolean;
  isSaving: boolean;
  campaignId: string;
  onParticipantUpdate: (id: string, updates: Partial<CombatParticipantDTO>) => void;
  onAddCondition: (participantId: string, conditionId: string, duration: number | null) => void;
  onRemoveCondition: (participantId: string, conditionId: string) => void;
  conditions: ConditionDTO[]; // Full conditions list
}

export function InitiativeList({
  participants,
  currentRound,
  activeParticipantIndex,
  onRollInitiative,
  onStartCombat,
  onNextTurn,
  onSave,
  isDirty,
  isSaving,
  campaignId,
  onParticipantUpdate,
  onAddCondition,
  onRemoveCondition,
  conditions,
}: InitiativeListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active participant
  useEffect(() => {
    if (activeItemRef.current && activeParticipantIndex !== null) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeParticipantIndex]);

  const isCombatStarted = activeParticipantIndex !== null;
  const hasParticipants = participants.length > 0;
  const allInitiativesSet = participants.length > 0 && participants.every((p) => p.initiative !== null);

  return (
    <div className="flex flex-col h-full border-r">
      <CombatControlBar
        currentRound={currentRound}
        isCombatStarted={isCombatStarted}
        hasParticipants={hasParticipants}
        allInitiativesSet={allInitiativesSet}
        isDirty={isDirty}
        isSaving={isSaving}
        onRollInitiative={onRollInitiative}
        onStartCombat={onStartCombat}
        onNextTurn={onNextTurn}
        onSave={onSave}
        campaignId={campaignId}
      />
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        {participants.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>No participants in combat</p>
          </div>
        ) : (
          participants.map((participant, index) => (
            <div key={participant.id} ref={index === activeParticipantIndex ? activeItemRef : undefined}>
              <InitiativeItem
                participant={participant}
                isActive={index === activeParticipantIndex}
                onUpdate={(updates) => onParticipantUpdate(participant.id, updates)}
                onRemoveCondition={(conditionId) => onRemoveCondition(participant.id, conditionId)}
                onAddCondition={(conditionId, duration) => onAddCondition(participant.id, conditionId, duration)}
                conditions={conditions}
              />
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
