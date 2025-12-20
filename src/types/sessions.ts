import type { Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';

// ============================================================================
// BASE TYPES
// ============================================================================

export type Session = Tables<'sessions'>;

export type SessionStatus = 'draft' | 'ready' | 'in_progress' | 'completed';

export type PinnedEntityType =
  | 'location'
  | 'npc'
  | 'player_character'
  | 'quest'
  | 'story_arc'
  | 'story_item'
  | 'faction'
  | 'lore_note';

// ============================================================================
// PLAN JSON TYPES (Session Prep)
// ============================================================================

/**
 * Goal item for session checklist
 */
export interface GoalItem {
  id: string;
  text: string;
  completed: boolean;
}

/**
 * Planned encounter (story or combat)
 */
export interface Encounter {
  id: string;
  type: 'story' | 'combat';
  name: string;
  description?: string;
}

/**
 * Pinned entity for quick access
 */
export interface PinnedEntity {
  id: string;
  type: PinnedEntityType;
  name: string;
}

/**
 * Session plan JSON structure
 */
export interface PlanJson {
  opening: JSONContent | null;
  goals: GoalItem[];
  encounters: Encounter[];
  pinned_entities: PinnedEntity[];
  notes: JSONContent | null;
}

// ============================================================================
// LOG JSON TYPES (Session Journal)
// ============================================================================

/**
 * Key event from session
 */
export interface KeyEvent {
  id: string;
  text: string;
}

/**
 * Loot item given during session
 */
export interface LootItem {
  id: string;
  name: string;
}

/**
 * Session log JSON structure
 */
export interface LogJson {
  summary: JSONContent | null;
  key_events: KeyEvent[];
  loot_given: LootItem[];
  xp_given: number;
}

// ============================================================================
// DTO TYPES
// ============================================================================

/**
 * Session DTO with typed Json fields
 */
export interface SessionDTO extends Omit<Session, 'plan_json' | 'log_json'> {
  plan_json: PlanJson | null;
  log_json: LogJson | null;
}

// ============================================================================
// COMMAND MODELS
// ============================================================================

export interface CreateSessionCommand {
  session_number: number;
  session_date: string; // YYYY-MM-DD
  in_game_date?: string | null;
  title?: string | null;
  plan_json?: PlanJson | null;
  log_json?: LogJson | null;
  status?: SessionStatus;
}

export interface UpdateSessionCommand {
  session_number?: number;
  session_date?: string;
  in_game_date?: string | null;
  title?: string | null;
  plan_json?: PlanJson | null;
  log_json?: LogJson | null;
  status?: SessionStatus;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface SessionFilters {
  status?: SessionStatus;
}

// ============================================================================
// VIEW MODELS
// ============================================================================

/**
 * Session card view model for list view
 */
export interface SessionCardViewModel {
  session: SessionDTO;
  goalsProgress: {
    completed: number;
    total: number;
  };
  hasJournal: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create empty plan JSON structure
 */
export function createEmptyPlanJson(): PlanJson {
  return {
    opening: null,
    goals: [],
    encounters: [],
    pinned_entities: [],
    notes: null,
  };
}

/**
 * Create empty log JSON structure
 */
export function createEmptyLogJson(): LogJson {
  return {
    summary: null,
    key_events: [],
    loot_given: [],
    xp_given: 0,
  };
}
