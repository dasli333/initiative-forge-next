import type { Tables } from '@/types/database';

export type EntityMention = Tables<'entity_mentions'>;

export interface CreateEntityMentionCommand {
  source_type: string; // npc, location, quest, session, etc.
  source_id: string;
  source_field: string; // biography, description, etc.
  mentioned_type: string;
  mentioned_id: string;
}

// Note: Entity mentions are typically auto-created when rich text is saved
// and deleted when entities are removed or rich text is updated
