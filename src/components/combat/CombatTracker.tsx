// Main Combat Tracker component orchestrating all sub-components

import { useEffect, useCallback, useState } from "react";
import { useCombatStore } from "@/stores/useCombatStore";
import { useConditions } from "@/hooks/useConditions";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { CombatDTO, ActiveConditionDTO, ActionDTO, CombatParticipantDTO } from "@/types";
import { InitiativeList } from "./initiative/InitiativeList";
import { ActiveCharacterSheet } from "./character-sheet/ActiveCharacterSheet";
import { ReferencePanel } from "./reference/ReferencePanel";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";

interface CombatTrackerProps {
  combatId: string;
  campaignId: string;
  initialData: CombatDTO;
}

export function CombatTracker({ initialData, campaignId }: CombatTrackerProps) {
  // Zustand store
  const {
    loadCombat,
    participants,
    activeParticipantIndex,
    currentRound,
    rollMode,
    recentRolls,
    rollInitiative,
    startCombat,
    nextTurn,
    updateHP,
    addCondition,
    removeCondition,
    executeAction,
    setRollMode,
    saveSnapshot,
    isDirty,
    isSaving,
  } = useCombatStore();

  // React Query
  const { data: conditions = [] } = useConditions();
  const typedConditions = conditions as any as import("@/types").ConditionDTO[];

  // Initialize combat state
  useEffect(() => {
    loadCombat(initialData);
  }, [initialData, loadCombat]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    " ": () => {
      // Space bar - next turn (only if combat started)
      if (activeParticipantIndex !== null) {
        nextTurn();
      }
    },
  });

  // Get active participant
  const activeParticipant = activeParticipantIndex !== null ? participants[activeParticipantIndex] : null;

  // Handlers
  const handleParticipantUpdate = useCallback(
    (id: string, updates: Partial<CombatParticipantDTO>) => {
      if (updates.current_hp !== undefined) {
        const participant = participants.find((p) => p.id === id);
        if (participant) {
          const diff = updates.current_hp - participant.current_hp;
          const type = diff > 0 ? "heal" : "damage";
          updateHP(id, Math.abs(diff), type);
        }
      }
    },
    [participants, updateHP]
  );

  const handleActionClick = useCallback(
    (action: ActionDTO) => {
      if (activeParticipant) {
        executeAction(activeParticipant.id, action);
      }
    },
    [activeParticipant, executeAction]
  );

  const handleAddCondition = useCallback(
    (participantId: string, conditionId: string, duration: number | null) => {
      const condition = typedConditions.find((c) => c.id === conditionId);
      if (condition) {
        const condName = condition.name as { en: string; pl: string } | null;
        const activeCondition: ActiveConditionDTO = {
          condition_id: condition.id,
          name: condName?.pl || condName?.en || 'Unknown', // Using Polish name for denormalized storage
          duration_in_rounds: duration,
        };
        addCondition(participantId, activeCondition);
      }
    },
    [typedConditions, addCondition]
  );

  const handleRemoveCondition = useCallback(
    (participantId: string, conditionId: string) => {
      removeCondition(participantId, conditionId);
    },
    [removeCondition]
  );

  // Unsaved changes dialog (simplified for now)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  return (
    <>
      <div className="h-full -m-4 md:-m-8 grid grid-cols-[minmax(0,30%)_minmax(0,50%)_minmax(0,20%)] overflow-x-hidden">
        {/* Left Column: Initiative List */}
        <div className="overflow-hidden min-w-0">
          <InitiativeList
            participants={participants}
            currentRound={currentRound}
            activeParticipantIndex={activeParticipantIndex}
            onRollInitiative={rollInitiative}
            onStartCombat={startCombat}
            onNextTurn={nextTurn}
            onSave={saveSnapshot}
            isDirty={isDirty}
            isSaving={isSaving}
            campaignId={campaignId}
            onParticipantUpdate={handleParticipantUpdate}
            onAddCondition={handleAddCondition}
            onRemoveCondition={handleRemoveCondition}
            conditions={typedConditions}
          />
        </div>

        {/* Middle Column: Active Character Sheet */}
        <div className="overflow-hidden min-w-0">
          <ActiveCharacterSheet participant={activeParticipant} onActionClick={handleActionClick} />
        </div>

        {/* Right Column: Reference Panel */}
        <div className="overflow-hidden min-w-0">
          <ReferencePanel
            conditions={typedConditions}
            rollMode={rollMode}
            recentRolls={recentRolls}
            onRollModeChange={setRollMode}
          />
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onSaveAndLeave={async () => {
          await saveSnapshot();
          setShowUnsavedDialog(false);
          // TODO: Navigate away
        }}
        onLeaveWithoutSaving={() => {
          setShowUnsavedDialog(false);
          // TODO: Navigate away
        }}
        onCancel={() => setShowUnsavedDialog(false)}
      />
    </>
  );
}
