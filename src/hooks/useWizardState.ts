import { useReducer, useCallback } from "react";
import type { WizardState } from "@/components/combat/wizard/types";

/**
 * Actions for wizard state reducer
 */
type WizardAction =
  | { type: "SET_STEP"; payload: 1 | 2 | 3 | 4 | 5 }
  | { type: "COMPLETE_STEP"; payload: number }
  | { type: "SET_COMBAT_NAME"; payload: string }
  | { type: "TOGGLE_CHARACTER"; payload: string }
  | { type: "SET_SELECTED_CHARACTERS"; payload: string[] }
  | { type: "ADD_MONSTER"; payload: { id: string; name: string } }
  | { type: "UPDATE_MONSTER_COUNT"; payload: { id: string; count: number } }
  | { type: "REMOVE_MONSTER"; payload: string }
  | { type: "SET_MONSTER_SEARCH"; payload: string }
  | { type: "SET_MONSTER_TYPE_FILTER"; payload: string | null }
  | { type: "TOGGLE_NPC"; payload: string }
  | { type: "SET_SELECTED_NPCS"; payload: string[] };

/**
 * Initial state factory
 */
function createInitialState(): WizardState {
  return {
    currentStep: 1,
    completedSteps: [],
    combatName: "",
    selectedPlayerCharacterIds: [],
    addedMonsters: new Map(),
    selectedNPCIds: [],
    monsterSearchTerm: "",
    monsterTypeFilter: null,
  };
}

/**
 * Wizard state reducer
 */
function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };

    case "COMPLETE_STEP": {
      const step = action.payload;
      if (state.completedSteps.includes(step)) {
        return state;
      }
      return { ...state, completedSteps: [...state.completedSteps, step] };
    }

    case "SET_COMBAT_NAME":
      return { ...state, combatName: action.payload };

    case "TOGGLE_CHARACTER": {
      const id = action.payload;
      const selectedIds = state.selectedPlayerCharacterIds;
      return {
        ...state,
        selectedPlayerCharacterIds: selectedIds.includes(id)
          ? selectedIds.filter((charId) => charId !== id)
          : [...selectedIds, id],
      };
    }

    case "SET_SELECTED_CHARACTERS":
      return { ...state, selectedPlayerCharacterIds: action.payload };

    case "ADD_MONSTER": {
      const { id, name } = action.payload;
      const newMap = new Map(state.addedMonsters);
      const existing = newMap.get(id);

      if (existing) {
        newMap.set(id, { ...existing, count: existing.count + 1 });
      } else {
        newMap.set(id, { monster_id: id, name, count: 1 });
      }

      return { ...state, addedMonsters: newMap };
    }

    case "UPDATE_MONSTER_COUNT": {
      const { id, count } = action.payload;
      if (count < 1) return state;

      const newMap = new Map(state.addedMonsters);
      const existing = newMap.get(id);

      if (existing) {
        newMap.set(id, { ...existing, count });
      }

      return { ...state, addedMonsters: newMap };
    }

    case "REMOVE_MONSTER": {
      const newMap = new Map(state.addedMonsters);
      newMap.delete(action.payload);
      return { ...state, addedMonsters: newMap };
    }

    case "SET_MONSTER_SEARCH":
      return { ...state, monsterSearchTerm: action.payload };

    case "SET_MONSTER_TYPE_FILTER":
      return { ...state, monsterTypeFilter: action.payload };

    case "TOGGLE_NPC": {
      const id = action.payload;
      const selectedIds = state.selectedNPCIds;
      return {
        ...state,
        selectedNPCIds: selectedIds.includes(id)
          ? selectedIds.filter((npcId) => npcId !== id)
          : [...selectedIds, id],
      };
    }

    case "SET_SELECTED_NPCS":
      return { ...state, selectedNPCIds: action.payload };

    default:
      return state;
  }
}

/**
 * Custom hook for managing wizard state with reducer pattern
 *
 * @example
 * ```tsx
 * const { state, actions } = useWizardState();
 *
 * // Navigate to next step
 * actions.setStep(2);
 *
 * // Add a monster
 * actions.addMonster({ id: "123", name: "Goblin" });
 * ```
 */
export function useWizardState() {
  const [state, dispatch] = useReducer(wizardReducer, undefined, createInitialState);

  // Memoized action creators
  const actions = {
    setStep: useCallback((step: 1 | 2 | 3 | 4 | 5) => {
      dispatch({ type: "SET_STEP", payload: step });
    }, []),

    completeStep: useCallback((step: number) => {
      dispatch({ type: "COMPLETE_STEP", payload: step });
    }, []),

    setCombatName: useCallback((name: string) => {
      dispatch({ type: "SET_COMBAT_NAME", payload: name });
    }, []),

    toggleCharacter: useCallback((id: string) => {
      dispatch({ type: "TOGGLE_CHARACTER", payload: id });
    }, []),

    setSelectedCharacters: useCallback((ids: string[]) => {
      dispatch({ type: "SET_SELECTED_CHARACTERS", payload: ids });
    }, []),

    addMonster: useCallback((payload: { id: string; name: string }) => {
      dispatch({ type: "ADD_MONSTER", payload });
    }, []),

    updateMonsterCount: useCallback((payload: { id: string; count: number }) => {
      dispatch({ type: "UPDATE_MONSTER_COUNT", payload });
    }, []),

    removeMonster: useCallback((id: string) => {
      dispatch({ type: "REMOVE_MONSTER", payload: id });
    }, []),

    setMonsterSearch: useCallback((term: string) => {
      dispatch({ type: "SET_MONSTER_SEARCH", payload: term });
    }, []),

    setMonsterTypeFilter: useCallback((type: string | null) => {
      dispatch({ type: "SET_MONSTER_TYPE_FILTER", payload: type });
    }, []),

    toggleNPC: useCallback((id: string) => {
      dispatch({ type: "TOGGLE_NPC", payload: id });
    }, []),

    setSelectedNPCs: useCallback((ids: string[]) => {
      dispatch({ type: "SET_SELECTED_NPCS", payload: ids });
    }, []),
  };

  return { state, actions };
}
