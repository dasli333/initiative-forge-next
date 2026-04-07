// Zustand store for combat state management
// This store manages real-time combat state with zero latency
// State is persisted to backend via saveSnapshot() method

import { create } from "zustand";
import type { CombatState } from "@/types/combat-view.types";
import type { CombatDTO, ActiveConditionDTO, ActionDTO, CombatSnapshotDTO } from "@/types";
import type { Json } from "@/types/database";
import { rollDice, calculateModifier, executeAttack, createRollResults } from "@/lib/dice";
import { getSupabaseClient } from "@/lib/supabase";

export const useCombatStore = create<CombatState>((set, get) => ({
  // Stan początkowy
  combat: null,
  participants: [],
  activeParticipantIndex: null,
  currentRound: 1,
  rollMode: "normal",
  recentRolls: [],
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,

  // Akcja: Załaduj combat z API (z migracją starych snapshotów)
  loadCombat: (combat: CombatDTO) => {
    const participants = (combat.state_snapshot?.participants || []).map(p => ({
      ...p,
      is_ally: p.is_ally ?? (p.source === "player_character"),
      is_dead: p.is_dead ?? false,
    }));

    set({
      combat,
      participants,
      activeParticipantIndex: combat.state_snapshot?.active_participant_index ?? null,
      currentRound: combat.current_round,
      isDirty: false,
      recentRolls: [],
    });
  },

  // Akcja: Rzuć inicjatywę dla wszystkich
  rollInitiative: () => {
    const { participants } = get();

    const withInitiative = participants.map((p) => ({
      ...p,
      initiative: rollDice(1, 20)[0] + calculateModifier(p.stats.dex),
    }));

    // Sortuj malejąco po inicjatywie (null na końcu)
    const sorted = withInitiative.sort((a, b) => {
      if (a.initiative === null) return 1;
      if (b.initiative === null) return -1;
      return b.initiative - a.initiative;
    });

    set({
      participants: sorted,
      isDirty: true,
    });
  },

  // Akcja: Rozpocznij walkę
  startCombat: () => {
    const { participants } = get();

    if (participants.length === 0) return;

    set({
      activeParticipantIndex: 0,
      currentRound: 1,
      isDirty: true,
    });
  },

  // Akcja: Następna tura
  nextTurn: () => {
    const { participants, activeParticipantIndex } = get();

    if (activeParticipantIndex === null) return;

    // Zmniejsz liczniki stanów dla aktywnego uczestnika
    const updatedParticipants = participants.map((p, index) => {
      if (index !== activeParticipantIndex) return p;

      // Zmniejsz duration_in_rounds o 1 i usuń stany które osiągnęły 0
      const updatedConditions = p.active_conditions
        .map((condition) => {
          if (condition.duration_in_rounds === null) {
            // Stan na czas nieokreślony - nie zmniejszamy
            return condition;
          }
          // Zmniejsz licznik
          return {
            ...condition,
            duration_in_rounds: condition.duration_in_rounds - 1,
          };
        })
        .filter((condition) => {
          // Usuń stany które osiągnęły 0
          return condition.duration_in_rounds === null || condition.duration_in_rounds > 0;
        });

      return {
        ...p,
        active_conditions: updatedConditions,
      };
    });

    // Znajdź następnego żywego uczestnika (pomijaj martwych)
    const total = updatedParticipants.length;
    let nextIndex = activeParticipantIndex + 1;
    let roundIncrement = 0;
    let searched = 0;

    while (searched < total) {
      if (nextIndex >= total) {
        nextIndex = 0;
        roundIncrement++;
      }
      if (!updatedParticipants[nextIndex].is_dead) break;
      nextIndex++;
      searched++;
    }

    // Wszyscy martwi — nie przesuwaj
    if (searched >= total) return;

    set((state) => ({
      participants: updatedParticipants,
      activeParticipantIndex: nextIndex,
      currentRound: state.currentRound + roundIncrement,
      isDirty: true,
    }));
  },

  // Akcja: Aktualizuj HP (z obsługą death saves i is_dead)
  updateHP: (participantId: string, amount: number, type: "damage" | "heal") => {
    set((state) => ({
      participants: state.participants.map((p) => {
        if (p.id !== participantId) return p;

        const delta = type === "damage" ? -amount : amount;
        const newHP = Math.max(0, Math.min(p.max_hp, p.current_hp + delta));
        const wasAtZero = p.current_hp === 0;
        const nowAtZero = newHP === 0;

        // Healed from 0 HP — clear death state
        if (wasAtZero && !nowAtZero) {
          return { ...p, current_hp: newHP, is_dead: false, death_saves: undefined };
        }

        // Dropped to 0 HP — all participants get death saves
        if (!wasAtZero && nowAtZero) {
          return { ...p, current_hp: 0, death_saves: { successes: 0, failures: 0 } };
        }

        return { ...p, current_hp: newHP };
      }),
      isDirty: true,
    }));
  },

  // Akcja: Dodaj warunek
  addCondition: (participantId: string, condition: ActiveConditionDTO) => {
    set((state) => ({
      participants: state.participants.map((p) => {
        if (p.id !== participantId) return p;

        // Sprawdź duplikaty
        if (p.active_conditions.some((c) => c.condition_id === condition.condition_id)) {
          return p;
        }

        return {
          ...p,
          active_conditions: [...p.active_conditions, condition],
        };
      }),
      isDirty: true,
    }));
  },

  // Akcja: Usuń warunek
  removeCondition: (participantId: string, conditionId: string) => {
    set((state) => ({
      participants: state.participants.map((p) => {
        if (p.id !== participantId) return p;

        return {
          ...p,
          active_conditions: p.active_conditions.filter((c) => c.condition_id !== conditionId),
        };
      }),
      isDirty: true,
    }));
  },

  // Akcja: Dodaj uczestników w trakcie walki (z automatyczną inicjatywą)
  addParticipants: (newParticipants) => {
    const { participants, activeParticipantIndex } = get();

    // Roll initiative for new participants
    const withInitiative = newParticipants.map((p) => ({
      ...p,
      initiative: rollDice(1, 20)[0] + calculateModifier(p.stats.dex),
    }));

    // Merge and re-sort by initiative (preserve active participant tracking)
    const activeId = activeParticipantIndex !== null ? participants[activeParticipantIndex]?.id : null;
    const merged = [...participants, ...withInitiative];
    merged.sort((a, b) => {
      if (a.initiative === null) return 1;
      if (b.initiative === null) return -1;
      return b.initiative - a.initiative;
    });

    // Restore active participant index after sort
    const newActiveIndex = activeId ? merged.findIndex((p) => p.id === activeId) : null;

    set({
      participants: merged,
      activeParticipantIndex: newActiveIndex !== -1 ? newActiveIndex : activeParticipantIndex,
      isDirty: true,
    });
  },

  // Akcja: Przełącz sojusznik/wróg
  toggleAlly: (participantId: string) => {
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === participantId ? { ...p, is_ally: !p.is_ally } : p
      ),
      isDirty: true,
    }));
  },

  // Akcja: Rzut na uratowanie przed śmiercią (D&D 5e)
  rollDeathSave: (participantId: string) => {
    const { participants } = get();
    const participant = participants.find((p) => p.id === participantId);
    if (!participant?.death_saves || participant.is_dead) return;

    const roll = rollDice(1, 20)[0];
    let { successes, failures } = participant.death_saves;

    if (roll === 20) {
      // Natural 20: regain 1 HP, clear death saves
      set((state) => ({
        participants: state.participants.map((p) =>
          p.id === participantId
            ? { ...p, current_hp: 1, death_saves: undefined }
            : p
        ),
        isDirty: true,
      }));
      return;
    }

    if (roll === 1) {
      failures = Math.min(3, failures + 2);
    } else if (roll >= 10) {
      successes = Math.min(3, successes + 1);
    } else {
      failures = Math.min(3, failures + 1);
    }

    const isDead = failures >= 3;
    const isStabilized = successes >= 3;

    set((state) => ({
      participants: state.participants.map((p) => {
        if (p.id !== participantId) return p;
        if (isDead) return { ...p, is_dead: true, death_saves: { successes, failures, last_roll: roll } };
        if (isStabilized) return { ...p, death_saves: undefined };
        return { ...p, death_saves: { successes, failures, last_roll: roll } };
      }),
      isDirty: true,
    }));
  },

  // Akcja: Ręczne dodanie wyniku death save (gracz rzuca fizycznymi kośćmi)
  addDeathSaveResult: (participantId: string, type: "success" | "failure") => {
    set((state) => ({
      participants: state.participants.map((p) => {
        if (p.id !== participantId || !p.death_saves || p.is_dead) return p;

        let { successes, failures } = p.death_saves;
        if (type === "success") {
          successes = Math.min(3, successes + 1);
        } else {
          failures = Math.min(3, failures + 1);
        }

        const isDead = failures >= 3;
        const isStabilized = successes >= 3;

        if (isDead) return { ...p, is_dead: true, death_saves: { successes, failures } };
        if (isStabilized) return { ...p, death_saves: undefined };
        return { ...p, death_saves: { successes, failures } };
      }),
      isDirty: true,
    }));
  },

  // Akcja: Natychmiastowe zabicie uczestnika
  killParticipant: (participantId: string) => {
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === participantId
          ? { ...p, current_hp: 0, is_dead: true, death_saves: undefined }
          : p
      ),
      isDirty: true,
    }));
  },

  // Akcja: Wykonaj akcję (atak)
  executeAction: (participantId: string, action: ActionDTO) => {
    const { rollMode } = get();

    // Wykonaj atak z obecnym trybem rzutu
    const result = executeAttack(action, rollMode);

    // Stwórz obiekty RollResult
    const rollResults = createRollResults(action, result.attack, result.damage);

    // Zastąp poprzednie rzuty (pokazuj tylko ostatnią akcję)
    set({
      recentRolls: rollResults,
    });
  },

  // Akcja: Zmień tryb rzutu
  setRollMode: (mode) => {
    set({ rollMode: mode });
  },

  // Akcja: Zapisz snapshot do API (Direct Supabase)
  saveSnapshot: async () => {
    const { combat, participants, activeParticipantIndex, currentRound, isSaving } = get();

    if (!combat || isSaving) return;

    set({ isSaving: true });

    try {
      const snapshot: CombatSnapshotDTO = {
        participants,
        active_participant_index: activeParticipantIndex,
      };

      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('combats')
        .update({
          state_snapshot: snapshot as unknown as Json,
          current_round: currentRound,
          updated_at: new Date().toISOString(),
        })
        .eq('id', combat.id);

      if (error) throw error;

      set({
        isDirty: false,
        isSaving: false,
        lastSavedAt: new Date(),
      });
    } catch (error) {
      set({ isSaving: false });
      // TODO: Wyświetl toast z błędem
      throw error;
    }
  },

  // Akcja: Oznacz jako zapisane
  markClean: () => {
    set({ isDirty: false });
  },

  // Akcja: Reset stanu
  reset: () => {
    set({
      combat: null,
      participants: [],
      activeParticipantIndex: null,
      currentRound: 1,
      rollMode: "normal",
      recentRolls: [],
      isDirty: false,
      isSaving: false,
      lastSavedAt: null,
    });
  },
}));
