import { useState, useEffect, useCallback, useMemo } from "react";
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

import {
  validateStep1,
  validateStep2,
  defaultSimpleNPCFormData,
  defaultAdvancedNPCFormData,
  mapWizardStateToCommand,
  simpleFormToAdHocNPC,
  advancedFormToAdHocNPC,
  validateSimpleNPCForm,
  validateAdvancedNPCForm,
} from "./utils";

import type {
  WizardState,
  SimpleNPCFormData,
  AdvancedNPCFormData,
  AddedMonsterViewModel,
  MonsterViewModel,
  PlayerCharacterViewModel,
} from "./types";

interface CombatCreationWizardProps {
  campaignId: string;
}

export function CombatCreationWizard({ campaignId }: CombatCreationWizardProps) {
  // ==================== ROUTER ====================
  const router = useRouter();

  // ==================== STATE ====================
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [combatName, setCombatName] = useState<string>("");
  const [selectedPlayerCharacterIds, setSelectedPlayerCharacterIds] = useState<string[]>([]);
  const [addedMonsters, setAddedMonsters] = useState<Map<string, AddedMonsterViewModel>>(new Map());
  const [addedNPCs, setAddedNPCs] = useState<WizardState["addedNPCs"]>([]);

  // Step 3 specific state
  const [monsterSearchTerm, setMonsterSearchTerm] = useState<string>("");
  const [monsterTypeFilter, setMonsterTypeFilter] = useState<string | null>(null);

  // Step 4 specific state
  const [npcMode, setNPCMode] = useState<"simple" | "advanced">("simple");
  const [npcFormData, setNPCFormData] = useState<SimpleNPCFormData | AdvancedNPCFormData>(defaultSimpleNPCFormData());

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ARIA announcements
  const [announcement, setAnnouncement] = useState<string>("");

  // ==================== QUERIES & MUTATIONS ====================
  const playerCharactersQuery = usePlayerCharacters(campaignId);
  const debouncedSearchTerm = useDebouncedValue(monsterSearchTerm, 300);
  const monstersQuery = useMonsters({
    searchQuery: debouncedSearchTerm,
    type: monsterTypeFilter,
    size: null,
    alignment: null,
    limit: 20,
  });
  const createCombatMutation = useCombatCreation(campaignId);

  // Language store for monster names
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);

  // ==================== DERIVED STATE ====================
  const playerCharacters = useMemo(() => {
    if (!playerCharactersQuery.data) return [];
    return playerCharactersQuery.data.map(
      (pc): PlayerCharacterViewModel => ({
        id: pc.id,
        name: pc.name,
        max_hp: pc.max_hp,
        armor_class: pc.armor_class,
      })
    );
  }, [playerCharactersQuery.data]);

  const monsters = useMemo(() => {
    if (!monstersQuery.data) return [];
    return monstersQuery.data.pages.flatMap((page) =>
      page.monsters
        .filter(monster => monster.data !== null)
        .map(
          (monster): MonsterViewModel => {
            const data = monster.data as any;
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
          }
        )
    );
  }, [monstersQuery.data, selectedLanguage]);

  const selectedPlayerCharacters = useMemo(() => {
    return playerCharacters.filter((pc) => selectedPlayerCharacterIds.includes(pc.id));
  }, [playerCharacters, selectedPlayerCharacterIds]);

  const isNPCFormValid = useMemo(() => {
    if (npcMode === "simple") {
      return validateSimpleNPCForm(npcFormData as SimpleNPCFormData).valid;
    } else {
      return validateAdvancedNPCForm(npcFormData as AdvancedNPCFormData).valid;
    }
  }, [npcMode, npcFormData]);

  // ==================== EFFECTS ====================
  // Auto-select all player characters on load (only once)
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  useEffect(() => {
    if (!hasAutoSelected && playerCharacters.length > 0 && selectedPlayerCharacterIds.length === 0) {
      setSelectedPlayerCharacterIds(playerCharacters.map((pc) => pc.id));
      setHasAutoSelected(true);
    }
  }, [playerCharacters, selectedPlayerCharacterIds.length, hasAutoSelected]);

  // Focus management on step change
  useEffect(() => {
    const heading = document.querySelector(`#step-${currentStep}-heading`) as HTMLElement;
    if (heading) {
      heading.focus();
    }
  }, [currentStep]);

  // ARIA announcements
  useEffect(() => {
    const stepNames = ["", "Combat Name", "Select Player Characters", "Add Monsters", "Add NPCs", "Summary"];
    setAnnouncement(`Step ${currentStep} of 5: ${stepNames[currentStep]}`);
  }, [currentStep]);

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

  const handleNPCModeChange = useCallback((newMode: "simple" | "advanced") => {
    setNPCMode(newMode);
    // Synchronously reset form data to prevent race condition
    if (newMode === "simple") {
      setNPCFormData(defaultSimpleNPCFormData());
    } else {
      setNPCFormData(defaultAdvancedNPCFormData());
    }
  }, []);

  // ==================== HANDLERS ====================
  const handleNext = useCallback(() => {
    // Validate current step
    if (currentStep === 1) {
      const validation = validateStep1(combatName);
      if (!validation.valid) return;
    } else if (currentStep === 2) {
      const validation = validateStep2(selectedPlayerCharacterIds);
      if (!validation.valid) return;
    }

    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Move to next step
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as 1 | 2 | 3 | 4 | 5);
    }
  }, [currentStep, combatName, selectedPlayerCharacterIds, completedSteps]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4 | 5);
    }
  }, [currentStep]);

  const handleTogglePlayerCharacter = useCallback((characterId: string) => {
    setSelectedPlayerCharacterIds((prev) => {
      if (prev.includes(characterId)) {
        return prev.filter((id) => id !== characterId);
      } else {
        return [...prev, characterId];
      }
    });
  }, []);

  const handleAddMonster = useCallback((monsterId: string, monsterName: string) => {
    setAddedMonsters((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(monsterId);

      if (existing) {
        newMap.set(monsterId, {
          ...existing,
          count: existing.count + 1,
        });
      } else {
        newMap.set(monsterId, {
          monster_id: monsterId,
          name: monsterName,
          count: 1,
        });
      }

      return newMap;
    });
  }, []);

  const handleUpdateMonsterCount = useCallback((monsterId: string, count: number) => {
    if (count < 1) return;

    setAddedMonsters((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(monsterId);

      if (existing) {
        newMap.set(monsterId, { ...existing, count });
      }

      return newMap;
    });
  }, []);

  const handleRemoveMonster = useCallback((monsterId: string) => {
    setAddedMonsters((prev) => {
      const newMap = new Map(prev);
      newMap.delete(monsterId);
      return newMap;
    });
  }, []);

  const handleNPCFormChange = useCallback((updates: Partial<SimpleNPCFormData | AdvancedNPCFormData>) => {
    setNPCFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleAddNPC = useCallback(() => {
    if (!isNPCFormValid) return;

    const npc =
      npcMode === "simple"
        ? simpleFormToAdHocNPC(npcFormData as SimpleNPCFormData)
        : advancedFormToAdHocNPC(npcFormData as AdvancedNPCFormData);

    setAddedNPCs((prev) => [...prev, npc]);

    // Reset form
    if (npcMode === "simple") {
      setNPCFormData(defaultSimpleNPCFormData());
    } else {
      setNPCFormData(defaultAdvancedNPCFormData());
    }
  }, [isNPCFormValid, npcMode, npcFormData]);

  const handleRemoveNPC = useCallback((npcId: string) => {
    setAddedNPCs((prev) => prev.filter((npc) => npc.id !== npcId));
  }, []);

  const handleSubmit = useCallback(() => {
    const wizardState: WizardState = {
      currentStep,
      completedSteps,
      combatName,
      selectedPlayerCharacterIds,
      addedMonsters,
      addedNPCs,
      monsterSearchTerm,
      monsterTypeFilter,
      npcMode,
      npcFormData,
    };

    const command = mapWizardStateToCommand(wizardState);

    createCombatMutation.mutate(command);
  }, [
    currentStep,
    completedSteps,
    combatName,
    selectedPlayerCharacterIds,
    addedMonsters,
    addedNPCs,
    monsterSearchTerm,
    monsterTypeFilter,
    npcMode,
    npcFormData,
    createCombatMutation,
  ]);

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
      <ProgressIndicator currentStep={currentStep} completedSteps={completedSteps} />

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 1 && (
          <Step1_CombatName combatName={combatName} onNameChange={setCombatName} onNext={handleNext} />
        )}

        {currentStep === 2 && (
          <Step2_SelectPlayerCharacters
            playerCharacters={playerCharacters}
            selectedIds={selectedPlayerCharacterIds}
            onToggle={handleTogglePlayerCharacter}
            onBack={handleBack}
            onNext={handleNext}
            isLoading={playerCharactersQuery.isLoading}
            error={playerCharactersQuery.error}
          />
        )}

        {currentStep === 3 && (
          <Step3_AddMonsters
            searchTerm={monsterSearchTerm}
            typeFilter={monsterTypeFilter}
            monsters={monsters}
            addedMonsters={addedMonsters}
            onSearchChange={setMonsterSearchTerm}
            onTypeFilterChange={setMonsterTypeFilter}
            onAddMonster={handleAddMonster}
            onUpdateCount={handleUpdateMonsterCount}
            onRemoveMonster={handleRemoveMonster}
            onLoadMore={() => monstersQuery.fetchNextPage()}
            hasMore={monstersQuery.hasNextPage || false}
            isLoading={monstersQuery.isFetchingNextPage}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}

        {currentStep === 4 && (
          <Step4_AddNPCs
            mode={npcMode}
            onModeChange={handleNPCModeChange}
            npcForm={npcFormData}
            onFormChange={handleNPCFormChange}
            onAddNPC={handleAddNPC}
            addedNPCs={addedNPCs}
            onRemoveNPC={handleRemoveNPC}
            onBack={handleBack}
            onNext={handleNext}
            isFormValid={isNPCFormValid}
          />
        )}

        {currentStep === 5 && (
          <Step5_Summary
            combatName={combatName}
            selectedPlayerCharacters={selectedPlayerCharacters}
            addedMonsters={addedMonsters}
            addedNPCs={addedNPCs}
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
