import { useReducer, useCallback } from "react";
import type { WizardState, AddedMonsterViewModel } from "@/components/combat/wizard/types";
import type { AdHocNPC, SimpleNPCFormData, AdvancedNPCFormData } from "@/lib/schemas";
import { defaultSimpleNPCFormData, defaultAdvancedNPCFormData } from "@/lib/combat-wizard";

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
  | { type: "SET_NPC_MODE"; payload: "simple" | "advanced" }
  | { type: "UPDATE_NPC_FORM"; payload: Partial<SimpleNPCFormData | AdvancedNPCFormData> }
  | { type: "ADD_NPC"; payload: AdHocNPC }
  | { type: "REMOVE_NPC"; payload: string }
  | { type: "RESET_NPC_FORM" };

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
    addedNPCs: [],
    monsterSearchTerm: "",
    monsterTypeFilter: null,
    npcMode: "simple",
    npcFormData: defaultSimpleNPCFormData(),
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

    case "SET_NPC_MODE": {
      const newMode = action.payload;
      return {
        ...state,
        npcMode: newMode,
        npcFormData:
          newMode === "simple"
            ? defaultSimpleNPCFormData()
            : defaultAdvancedNPCFormData(),
      };
    }

    case "UPDATE_NPC_FORM":
      return {
        ...state,
        npcFormData: { ...state.npcFormData, ...action.payload },
      };

    case "ADD_NPC":
      return {
        ...state,
        addedNPCs: [...state.addedNPCs, action.payload],
      };

    case "REMOVE_NPC":
      return {
        ...state,
        addedNPCs: state.addedNPCs.filter((npc) => npc.id !== action.payload),
      };

    case "RESET_NPC_FORM":
      return {
        ...state,
        npcFormData:
          state.npcMode === "simple"
            ? defaultSimpleNPCFormData()
            : defaultAdvancedNPCFormData(),
      };

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

    setNPCMode: useCallback((mode: "simple" | "advanced") => {
      dispatch({ type: "SET_NPC_MODE", payload: mode });
    }, []),

    updateNPCForm: useCallback(
      (updates: Partial<SimpleNPCFormData | AdvancedNPCFormData>) => {
        dispatch({ type: "UPDATE_NPC_FORM", payload: updates });
      },
      []
    ),

    addNPC: useCallback((npc: AdHocNPC) => {
      dispatch({ type: "ADD_NPC", payload: npc });
    }, []),

    removeNPC: useCallback((id: string) => {
      dispatch({ type: "REMOVE_NPC", payload: id });
    }, []),

    resetNPCForm: useCallback(() => {
      dispatch({ type: "RESET_NPC_FORM" });
    }, []),
  };

  return { state, actions };
}
