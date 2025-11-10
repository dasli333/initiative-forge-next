import type { Tables } from '@/types/database';

export type FactionRelationship = Tables<'faction_relationships'>;

export interface CreateFactionRelationshipCommand {
  faction_id_1: string;
  faction_id_2: string;
  relationship_type: string; // alliance, war, rivalry, neutral
  description?: string | null;
}

export interface UpdateFactionRelationshipCommand {
  relationship_type?: string;
  description?: string | null;
}
