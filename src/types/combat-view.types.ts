// Type definitions for Combat View
// These types are used in the combat tracker UI components and state management

import type { CombatDTO, CombatParticipantDTO } from "@/types";

/**
 * Tryb rzutu kością d20
 */
export type RollMode = "normal" | "advantage" | "disadvantage";

/**
 * Wynik pojedynczego rzutu (dla roll log)
 */
export interface RollResult {
  id: string; // UUID dla React keys
  type: "attack" | "damage" | "save"; // Typ rzutu
  result: number; // Końcowy wynik (po modyfikatorach)
  formula: string; // Wzór, np. "1d20+5" lub "2d6+3"
  rolls: number[]; // Pojedyncze rzuty kośćmi, np. [12, 18] dla advantage
  modifier: number; // Bonus/penalty
  timestamp: Date; // Czas wykonania
  isCrit?: boolean; // Natural 20 na ataku
  isFail?: boolean; // Natural 1 na ataku
  actionName?: string; // Nazwa akcji, np. "Longsword Attack"
  damageType?: string; // Typ obrażeń, np. "Piercing", "Fire" (tylko dla type="damage")
}

/**
 * Aktywna zakładka w panelu referencyjnym
 */
export type ReferenceTab = "conditions" | "spells" | "monsters";

/**
 * Zmiana HP uczestnika
 */
export interface HPChange {
  participantId: string;
  amount: number;
  type: "damage" | "heal";
}

/**
 * Aplikacja warunku do uczestnika
 */
export interface ConditionApplication {
  participantId: string;
  conditionId: string;
  durationInRounds: number | null; // null = nieokreślony
}

/**
 * Stan walki dla Zustand store
 */
export interface CombatState {
  // Stan podstawowy
  combat: CombatDTO | null;
  participants: CombatParticipantDTO[];
  activeParticipantIndex: number | null;
  currentRound: number;

  // Stan UI
  rollMode: RollMode;
  recentRolls: RollResult[];
  isDirty: boolean; // Czy są niezapisane zmiany
  isSaving: boolean; // Czy trwa zapis
  lastSavedAt: Date | null; // Ostatni udany zapis

  // Akcje
  loadCombat: (combat: CombatDTO) => void;
  rollInitiative: () => void;
  startCombat: () => void;
  nextTurn: () => void;
  updateHP: (participantId: string, amount: number, type: "damage" | "heal") => void;
  addCondition: (participantId: string, condition: import("@/types").ActiveConditionDTO) => void;
  removeCondition: (participantId: string, conditionId: string) => void;
  executeAction: (participantId: string, action: import("@/types").ActionDTO) => void;
  setRollMode: (mode: RollMode) => void;
  saveSnapshot: () => Promise<void>;
  markClean: () => void;
  reset: () => void;
}
