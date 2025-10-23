// Type definitions for Combat Creation Wizard

import type {
  StatsDTO,
  ActionDTO,
  PlayerCharacterDTO,
  MonsterDTO,
  CreateCombatCommand,
  InitialParticipantCommand,
} from "@/types";

/**
 * Stan głównego wizardu przechowywany w komponencie CombatCreationWizard
 */
export interface WizardState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  completedSteps: number[]; // np. [1, 2] jeśli użytkownik jest na Step 3
  combatName: string;
  selectedPlayerCharacterIds: string[];
  addedMonsters: Map<string, AddedMonsterViewModel>; // monster_id -> AddedMonsterViewModel
  addedNPCs: AdHocNPC[];

  // Step 3 specific state
  monsterSearchTerm: string;
  monsterTypeFilter: string | null;

  // Step 4 specific state
  npcMode: "simple" | "advanced";
  npcFormData: SimpleNPCFormData | AdvancedNPCFormData;
}

/**
 * ViewModel dla postaci gracza w Step 2
 */
export interface PlayerCharacterViewModel {
  id: string;
  name: string;
  max_hp: number;
  armor_class: number;
}

/**
 * ViewModel dla potwora w Step 3 (lewy panel)
 */
export interface MonsterViewModel {
  id: string;
  name: string; // z data.name.pl (fallback do en)
  cr: string; // z data.challengeRating.rating
  type: string; // z data.type
  size: string; // z data.size
  hp: number; // z data.hitPoints.average
  ac: number; // z data.armorClass
  actions: ActionDTO[]; // z data.actions
  traits: unknown[]; // z data.traits
  speed: string[]; // z data.speed
  abilityScores: unknown; // z data.abilityScores
}

/**
 * ViewModel dla dodanego potwora w Step 3 (prawy panel)
 */
export interface AddedMonsterViewModel {
  monster_id: string;
  name: string;
  count: number;
}

/**
 * Dane formularza Simple Mode
 */
export interface SimpleNPCFormData {
  display_name: string;
  max_hp: number;
  armor_class: number;
  initiative_modifier?: number;
}

/**
 * Dane formularza Advanced Mode
 */
export interface AdvancedNPCFormData {
  display_name: string;
  max_hp: number;
  armor_class: number;
  speed: string;
  stats: StatsDTO; // { str, dex, con, int, wis, cha }
  actions: ActionDTO[]; // lista akcji
}

/**
 * Ad-hoc NPC dodany do listy
 * Zawiera temporary ID dla UI oraz wszystkie dane
 */
export interface AdHocNPC {
  id: string; // temporary UUID wygenerowany w UI (crypto.randomUUID())
  display_name: string;
  max_hp: number;
  armor_class: number;
  stats: StatsDTO;
  actions: ActionDTO[];
  // Opcjonalne pola z Simple Mode
  initiative_modifier?: number;
  // Opcjonalne pola z Advanced Mode
  speed?: string;
}

/**
 * Props dla ProgressIndicator
 */
export interface ProgressIndicatorProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  completedSteps: number[];
}

/**
 * Props dla Step 1
 */
export interface Step1Props {
  combatName: string;
  onNameChange: (name: string) => void;
  onNext: () => void;
}

/**
 * Props dla Step 2
 */
export interface Step2Props {
  playerCharacters: PlayerCharacterViewModel[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Props dla Step 3
 */
export interface Step3Props {
  searchTerm: string;
  typeFilter: string | null;
  monsters: MonsterViewModel[];
  addedMonsters: Map<string, AddedMonsterViewModel>;
  onSearchChange: (term: string) => void;
  onTypeFilterChange: (type: string | null) => void;
  onAddMonster: (monsterId: string, monsterName: string) => void;
  onUpdateCount: (monsterId: string, count: number) => void;
  onRemoveMonster: (monsterId: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

/**
 * Props dla Step 4
 */
export interface Step4Props {
  mode: "simple" | "advanced";
  onModeChange: (mode: "simple" | "advanced") => void;
  npcForm: SimpleNPCFormData | AdvancedNPCFormData;
  onFormChange: (updates: Partial<SimpleNPCFormData | AdvancedNPCFormData>) => void;
  onAddNPC: () => void;
  addedNPCs: AdHocNPC[];
  onRemoveNPC: (npcId: string) => void;
  onBack: () => void;
  onNext: () => void;
  isFormValid: boolean;
}

/**
 * Props dla Step 5
 */
export interface Step5Props {
  combatName: string;
  selectedPlayerCharacters: PlayerCharacterViewModel[];
  addedMonsters: Map<string, AddedMonsterViewModel>;
  addedNPCs: AdHocNPC[];
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// Re-export types from main types file for convenience
export type { StatsDTO, ActionDTO, PlayerCharacterDTO, MonsterDTO, CreateCombatCommand, InitialParticipantCommand };
