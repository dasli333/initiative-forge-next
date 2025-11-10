import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ProgressIndicator } from "./ProgressIndicator";
import { Step1_CombatName } from "./Step1_CombatName";
import { Step2_SelectPlayerCharacters } from "./Step2_SelectPlayerCharacters";
import { Step3_AddMonsters } from "./Step3_AddMonsters";
import { Step4_AddNPCs } from "./Step4_AddNPCs";
import { Step5_Summary } from "./Step5_Summary";

import { usePlayerCharacters } from "./hooks/usePlayerCharacters";
import { useMonsters } from "@/components/hooks/useMonsters";
import { useCombatCreation } from "./hooks/useCombatCreation";
import { useDebouncedValue } from "@/components/hooks/useDebouncedValue";
import { useLanguageStore } from "@/stores/languageStore";
import { useWizardState } from "@/hooks/useWizardState";

import {
  validateStep1,
  validateStep2,
  mapWizardStateToCommand,
  simpleFormToAdHocNPC,
  advancedFormToAdHocNPC,
  validateSimpleNPCForm,
  validateAdvancedNPCForm,
} from "@/lib/combat-wizard";

import type { PlayerCharacterViewModel, MonsterViewModel } from "./types";
import type { SimpleNPCFormData, AdvancedNPCFormData } from "@/lib/schemas";

interface CombatCreationWizardProps {
  campaignId: string;
}

export function CombatCreationWizard({ campaignId }: CombatCreationWizardProps) {
  // ==================== ROUTER ====================
  const router = useRouter();

  // ==================== STATE (using useWizardState) ====================
  const { state, actions } = useWizardState();
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ==================== QUERIES & MUTATIONS ====================
  const playerCharactersQuery = usePlayerCharacters(campaignId);
  const debouncedSearchTerm = useDebouncedValue(state.monsterSearchTerm, 300);
  const monstersQuery = useMonsters({
    searchQuery: debouncedSearchTerm,
    type: state.monsterTypeFilter,
    size: null,
    alignment: null,
    limit: 20,
  });
  const createCombatMutation = useCombatCreation(campaignId);

  // Language store for monster names
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);

  // ==================== DERIVED STATE ====================
  const playerCharacters = playerCharactersQuery.data || [];

  const monsters = useMemo(() => {
    if (!monstersQuery.data) return [];
    return monstersQuery.data.pages.flatMap((page) =>
      page.monsters
        .filter((monster) => monster.data !== null)
        .map((monster): MonsterViewModel => {
          const data = monster.data;
          return {
            id: monster.id,
            name: data.name[selectedLanguage] || data.name.en,
            cr: data.challengeRating.rating,
            type: data.type,
            size: data.size,
            hp: data.hitPoints.average,
            ac: data.armorClass,
            actions: data.actions,
            traits: data.traits,
            speed: data.speed,
            abilityScores: data.abilityScores,
          };
        })
    );
  }, [monstersQuery.data, selectedLanguage]);

  const selectedPlayerCharacters = useMemo(() => {
    return playerCharacters.filter((pc) => state.selectedPlayerCharacterIds.includes(pc.id));
  }, [playerCharacters, state.selectedPlayerCharacterIds]);

  const isNPCFormValid = useMemo(() => {
    if (state.npcMode === "simple") {
      return validateSimpleNPCForm(state.npcFormData as SimpleNPCFormData).valid;
    } else {
      return validateAdvancedNPCForm(state.npcFormData as AdvancedNPCFormData).valid;
    }
  }, [state.npcMode, state.npcFormData]);

  // ARIA announcement derived from current step
  const announcement = useMemo(() => {
    const stepNames = ["", "Combat Name", "Select Player Characters", "Add Monsters", "Add NPCs", "Summary"];
    return `Step ${state.currentStep} of 5: ${stepNames[state.currentStep]}`;
  }, [state.currentStep]);

  // ==================== EFFECTS ====================
  // Auto-select player characters with combat stats on load (only once)
  const hasAutoSelectedRef = useRef(false);

  useEffect(() => {
    if (!hasAutoSelectedRef.current && playerCharacters.length > 0 && state.selectedPlayerCharacterIds.length === 0) {
      // Only auto-select characters that have combat stats (HP and AC)
      actions.setSelectedCharacters(
        playerCharacters
          .filter((pc) => pc.max_hp && pc.armor_class)
          .map((pc) => pc.id)
      );
      hasAutoSelectedRef.current = true;
    }
  }, [playerCharacters, state.selectedPlayerCharacterIds.length, actions]);

  // Focus management on step change
  useEffect(() => {
    const heading = document.querySelector(`#step-${state.currentStep}-heading`) as HTMLElement;
    if (heading) {
      heading.focus();
    }
  }, [state.currentStep]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowCancelModal(true);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // ==================== HANDLERS ====================
  const handleNext = useCallback(() => {
    // Validate current step
    if (state.currentStep === 1) {
      const validation = validateStep1(state.combatName);
      if (!validation.valid) return;
    } else if (state.currentStep === 2) {
      const validation = validateStep2(state.selectedPlayerCharacterIds);
      if (!validation.valid) return;

      // Cleanup: Remove any selected characters that don't have combat stats
      const validCharacterIds = playerCharacters
        .filter((pc) => pc.max_hp && pc.armor_class)
        .map((pc) => pc.id);

      const cleanedSelectedIds = state.selectedPlayerCharacterIds.filter((id) =>
        validCharacterIds.includes(id)
      );

      // Update selection if any invalid characters were removed
      if (cleanedSelectedIds.length !== state.selectedPlayerCharacterIds.length) {
        actions.setSelectedCharacters(cleanedSelectedIds);
      }
    }

    // Mark current step as completed
    if (!state.completedSteps.includes(state.currentStep)) {
      actions.completeStep(state.currentStep);
    }

    // Move to next step
    if (state.currentStep < 5) {
      actions.setStep((state.currentStep + 1) as 1 | 2 | 3 | 4 | 5);
    }
  }, [state.currentStep, state.combatName, state.selectedPlayerCharacterIds, state.completedSteps, actions, playerCharacters]);

  const handleBack = useCallback(() => {
    if (state.currentStep > 1) {
      actions.setStep((state.currentStep - 1) as 1 | 2 | 3 | 4 | 5);
    }
  }, [state.currentStep, actions]);

  const handleSkipStep2 = useCallback(() => {
    // Skip validation for Step 2 when there are no player characters
    // Mark step as completed and move to Step 3
    if (!state.completedSteps.includes(2)) {
      actions.completeStep(2);
    }
    actions.setStep(3);
  }, [state.completedSteps, actions]);

  const handleAddNPC = useCallback(() => {
    if (!isNPCFormValid) return;

    const npc =
      state.npcMode === "simple"
        ? simpleFormToAdHocNPC(state.npcFormData as SimpleNPCFormData)
        : advancedFormToAdHocNPC(state.npcFormData as AdvancedNPCFormData);

    actions.addNPC(npc);
    actions.resetNPCForm();
  }, [isNPCFormValid, state.npcMode, state.npcFormData, actions]);

  const handleSubmit = useCallback(() => {
    const command = mapWizardStateToCommand({
      combatName: state.combatName,
      selectedPlayerCharacterIds: state.selectedPlayerCharacterIds,
      addedMonsters: state.addedMonsters,
      addedNPCs: state.addedNPCs,
    });

    createCombatMutation.mutate(command);
  }, [state.combatName, state.selectedPlayerCharacterIds, state.addedMonsters, state.addedNPCs, createCombatMutation]);

  const handleCancel = useCallback(() => {
    router.push(`/campaigns/${campaignId}/combats`);
  }, [campaignId, router]);

  // ==================== RENDER ====================
  return (
    <div className="container mx-auto py-8 px-4">
      {/* ARIA live announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator currentStep={state.currentStep} completedSteps={state.completedSteps} />

      {/* Step Content */}
      <div className="mt-8">
        {state.currentStep === 1 && (
          <Step1_CombatName combatName={state.combatName} onNameChange={actions.setCombatName} onNext={handleNext} />
        )}

        {state.currentStep === 2 && (
          <Step2_SelectPlayerCharacters
            campaignId={campaignId}
            playerCharacters={playerCharacters}
            selectedIds={state.selectedPlayerCharacterIds}
            onToggle={actions.toggleCharacter}
            onBack={handleBack}
            onNext={handleNext}
            onSkip={handleSkipStep2}
            isLoading={playerCharactersQuery.isLoading}
            error={playerCharactersQuery.error}
          />
        )}

        {state.currentStep === 3 && (
          <Step3_AddMonsters
            searchTerm={state.monsterSearchTerm}
            typeFilter={state.monsterTypeFilter}
            monsters={monsters}
            addedMonsters={state.addedMonsters}
            onSearchChange={actions.setMonsterSearch}
            onTypeFilterChange={actions.setMonsterTypeFilter}
            onAddMonster={(id, name) => actions.addMonster({ id, name })}
            onUpdateCount={(id, count) => actions.updateMonsterCount({ id, count })}
            onRemoveMonster={actions.removeMonster}
            onLoadMore={() => monstersQuery.fetchNextPage()}
            hasMore={monstersQuery.hasNextPage || false}
            isLoading={monstersQuery.isFetchingNextPage}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}

        {state.currentStep === 4 && (
          <Step4_AddNPCs
            mode={state.npcMode}
            onModeChange={actions.setNPCMode}
            npcForm={state.npcFormData}
            onFormChange={actions.updateNPCForm}
            onAddNPC={handleAddNPC}
            addedNPCs={state.addedNPCs}
            onRemoveNPC={actions.removeNPC}
            onBack={handleBack}
            onNext={handleNext}
            isFormValid={isNPCFormValid}
          />
        )}

        {state.currentStep === 5 && (
          <Step5_Summary
            combatName={state.combatName}
            selectedPlayerCharacters={selectedPlayerCharacters}
            addedMonsters={state.addedMonsters}
            addedNPCs={state.addedNPCs}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={createCombatMutation.isPending}
          />
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <AlertDialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard combat?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discard this combat? All progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
