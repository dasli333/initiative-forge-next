import type { Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type Quest = Tables<'quests'>;

/**
 * Quest objective structure (simple checklist item)
 */
export interface QuestObjective {
  description: string;
  completed: boolean;
}

/**
 * Quest rewards structure
 */
export interface QuestRewards {
  gold?: number;
  items?: string[];
  xp?: number;
  other?: string;
}

/**
 * Quest DTO with typed Json fields
 */
export interface QuestDTO extends Omit<Quest, 'description_json' | 'objectives_json' | 'rewards_json'> {
  description_json: JSONContent | null;
  objectives_json: QuestObjective[] | null;
  rewards_json: QuestRewards | null;
  // Joined fields from relations
  quest_giver_name?: string | null;
  story_arc_name?: string | null;
}

// ============================================================================
// COMMAND MODELS
// ============================================================================

/**
 * Create quest command
 * campaign_id is passed separately in API function
 */
export interface CreateQuestCommand {
  title: string;
  quest_type?: 'main' | 'side';
  quest_giver_id?: string | null;
  story_arc_id?: string | null;
  description_json?: JSONContent | null; // Rich text with @mentions
  objectives_json?: QuestObjective[] | null; // List of objectives
  rewards_json?: QuestRewards | null; // Structured rewards: {gold, items, xp, other}
  status?: 'not_started' | 'active' | 'completed' | 'failed';
  notes?: string | null;
  start_date?: string | null;
  deadline?: string | null;
}

/**
 * Update quest command
 * All fields are optional for partial updates
 */
export interface UpdateQuestCommand {
  title?: string;
  quest_type?: 'main' | 'side';
  quest_giver_id?: string | null;
  story_arc_id?: string | null;
  description_json?: JSONContent | null;
  objectives_json?: QuestObjective[] | null;
  rewards_json?: QuestRewards | null;
  status?: 'not_started' | 'active' | 'completed' | 'failed';
  notes?: string | null;
  start_date?: string | null;
  deadline?: string | null;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filters for querying quests
 */
export interface QuestFilters {
  status?: 'not_started' | 'active' | 'completed' | 'failed';
  quest_type?: 'main' | 'side';
  story_arc_id?: string | null;
  quest_giver_id?: string | null;
}

// ============================================================================
// VIEW MODELS
// ============================================================================

/**
 * Quest card view model for list view
 */
export interface QuestCardViewModel {
  quest: QuestDTO;
  objectivesProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  rewardsSummary: string;
}

/**
 * Quest details view model for detail panel
 */
export interface QuestDetailsViewModel extends QuestCardViewModel {
  backlinks: BacklinkItem[];
}

/**
 * Backlink item (where this quest is mentioned)
 */
export interface BacklinkItem {
  source_type: 'npc' | 'quest' | 'session' | 'location' | 'faction' | 'story_arc' | 'lore_note';
  source_id: string;
  source_name: string;
  source_field: string;
}
