import type { Tables } from '@/types/database';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type QuestEntity = Tables<'quest_entities'>;

// ============================================================================
// COMMAND MODELS
// ============================================================================

/**
 * Add quest entity command (many-to-many relationship)
 * quest_id is passed separately in API function
 */
export interface AddQuestEntityCommand {
  entity_type: string; // 'npc' | 'location' | ...
  entity_id: string;
  role?: string | null; // 'quest_giver' | 'target' | 'location' | ...
}

/**
 * Update quest entity role
 */
export interface UpdateQuestEntityCommand {
  role?: string | null;
}
