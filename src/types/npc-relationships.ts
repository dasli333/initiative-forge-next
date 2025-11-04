import type { Tables } from '@/types/database';

export type NPCRelationship = Tables<'npc_relationships'>;

export interface CreateNPCRelationshipCommand {
  npc_id_1: string;
  npc_id_2: string;
  relationship_type: string; // Free text: brother, enemy, mentor, etc.
  description?: string | null;
  strength?: number; // 0-100, default 50
}

export interface UpdateNPCRelationshipCommand {
  relationship_type?: string;
  description?: string | null;
  strength?: number;
}
