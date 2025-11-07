'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getNPCs,
  getNPC,
  createNPC,
  updateNPC,
  deleteNPC,
} from '@/lib/api/npcs';
import {
  getNPCCombatStats,
  upsertNPCCombatStats,
  deleteNPCCombatStats,
} from '@/lib/api/npc-combat-stats';
import {
  getNPCRelationships,
  createNPCRelationship,
  updateNPCRelationship,
  deleteNPCRelationship,
} from '@/lib/api/npc-relationships';
import { getMentionsOf } from '@/lib/api/entity-mentions';
import type {
  NPCDTO,
  CreateNPCCommand,
  UpdateNPCCommand,
  NPCFilters,
  NPCDetailsViewModel,
  NPCRelationshipViewModel,
} from '@/types/npcs';
import type { UpsertNPCCombatStatsCommand } from '@/types/npc-combat-stats';
import type { CreateNPCRelationshipCommand, UpdateNPCRelationshipCommand } from '@/types/npc-relationships';

// Backward compat
type NPCSDTO = NPCDTO;

/**
 * React Query hook for fetching NPCs for a campaign
 */
export function useNPCsQuery(campaignId: string, filters?: NPCFilters) {
  const router = useRouter();

  return useQuery({
    queryKey: ['npcs', campaignId, filters],
    queryFn: async (): Promise<NPCSDTO[]> => {
      try {
        return await getNPCs(campaignId, filters);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!campaignId,
  });
}

/**
 * React Query hook for fetching a single NPC
 */
export function useNPCQuery(npcId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['npc', npcId],
    queryFn: async (): Promise<NPCSDTO> => {
      if (!npcId) throw new Error('NPC ID is required');

      try {
        return await getNPC(npcId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!npcId,
  });
}

/**
 * Mutation hook for creating a new NPC
 */
export function useCreateNPCMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreateNPCCommand): Promise<NPCSDTO> => {
      try {
        return await createNPC(campaignId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (command) => {
      await queryClient.cancelQueries({ queryKey: ['npcs', campaignId] });

      const previousNPCs = queryClient.getQueryData<NPCSDTO[]>(['npcs', campaignId]);

      if (previousNPCs) {
        const tempNPC: NPCSDTO = {
          id: `temp-${Date.now()}`,
          campaign_id: campaignId,
          name: command.name,
          role: command.role || null,
          biography_json: command.biography_json || null,
          personality_json: command.personality_json || null,
          image_url: command.image_url || null,
          faction_id: command.faction_id || null,
          current_location_id: command.current_location_id || null,
          status: command.status || 'alive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData<NPCSDTO[]>(['npcs', campaignId], [...previousNPCs, tempNPC]);
      }

      return { previousNPCs };
    },
    onError: (err, _command, context) => {
      if (context?.previousNPCs) {
        queryClient.setQueryData(['npcs', campaignId], context.previousNPCs);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.';

      toast.error('Error', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('NPC created', {
        description: 'Your NPC has been created successfully.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['npcs', campaignId] });
    },
  });
}

/**
 * Mutation hook for updating an NPC
 */
export function useUpdateNPCMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, command }: { id: string; command: UpdateNPCCommand }): Promise<NPCSDTO> => {
      try {
        return await updateNPC(id, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async ({ id, command }) => {
      await queryClient.cancelQueries({ queryKey: ['npcs', campaignId] });
      await queryClient.cancelQueries({ queryKey: ['npc', id] });

      const previousNPCs = queryClient.getQueryData<NPCSDTO[]>(['npcs', campaignId]);
      const previousNPC = queryClient.getQueryData<NPCSDTO>(['npc', id]);

      if (previousNPCs) {
        queryClient.setQueryData<NPCSDTO[]>(
          ['npcs', campaignId],
          previousNPCs.map((n) => (n.id === id ? { ...n, ...command } as NPCSDTO : n))
        );
      }

      if (previousNPC) {
        queryClient.setQueryData<NPCSDTO>(['npc', id], {
          ...previousNPC,
          ...command,
        } as NPCSDTO);
      }

      return { previousNPCs, previousNPC };
    },
    onError: (err, variables, context) => {
      if (context?.previousNPCs) {
        queryClient.setQueryData(['npcs', campaignId], context.previousNPCs);
      }
      if (context?.previousNPC) {
        queryClient.setQueryData(['npc', variables.id], context.previousNPC);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.';

      toast.error('Error', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('NPC updated', {
        description: 'NPC has been updated successfully.',
      });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['npcs', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['npc', variables.id] });
    },
  });
}

/**
 * Mutation hook for deleting an NPC
 */
export function useDeleteNPCMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        await deleteNPC(id);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['npcs', campaignId] });

      const previousNPCs = queryClient.getQueryData<NPCSDTO[]>(['npcs', campaignId]);

      if (previousNPCs) {
        queryClient.setQueryData<NPCSDTO[]>(
          ['npcs', campaignId],
          previousNPCs.filter((n) => n.id !== id)
        );
      }

      return { previousNPCs };
    },
    onError: (err, id, context) => {
      if (context?.previousNPCs) {
        queryClient.setQueryData(['npcs', campaignId], context.previousNPCs);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : 'Failed to delete NPC. Please try again.';

      toast.error('Error', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('NPC deleted', {
        description: 'NPC has been removed successfully.',
      });
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['npcs', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['npc', id] });
    },
  });
}

// ============================================================================
// NPC DETAILS (with combat + relationships + backlinks)
// ============================================================================

/**
 * Query: Get full NPC details (NPC + combat stats + relationships + backlinks)
 * Used in NPCDetailSlideover
 */
export function useNPCDetailsQuery(npcId: string | null): UseQueryResult<NPCDetailsViewModel, Error> {
  return useQuery({
    queryKey: ['npc', npcId, 'details'],
    queryFn: async () => {
      if (!npcId) throw new Error('NPC ID is required');

      // Fetch all data in parallel
      const [npc, combatStats, relationships, backlinks] = await Promise.all([
        getNPC(npcId),
        getNPCCombatStats(npcId),
        getNPCRelationships(npcId),
        getMentionsOf('npc', npcId),
      ]);

      // Enrich relationships with other NPC data
      const enrichedRelationships: NPCRelationshipViewModel[] = await Promise.all(
        relationships.map(async (rel) => {
          const otherNpcId = rel.npc_id_1 === npcId ? rel.npc_id_2 : rel.npc_id_1;

          try {
            const otherNpc = await getNPC(otherNpcId);
            return {
              relationship: rel,
              otherNpcName: otherNpc.name,
              otherNpcImageUrl: otherNpc.image_url || undefined,
            };
          } catch (error) {
            console.error('Failed to fetch other NPC:', error);
            return {
              relationship: rel,
              otherNpcName: 'Unknown',
              otherNpcImageUrl: undefined,
            };
          }
        })
      );

      // Map backlinks to BacklinkItem format
      const backlinkItems = backlinks.map((mention) => ({
        source_type: mention.source_type as any,
        source_id: mention.source_id,
        source_name: '', // TODO: Fetch source name (needs additional API)
        source_field: mention.source_field,
      }));

      return {
        npc,
        combatStats,
        relationships: enrichedRelationships,
        backlinks: backlinkItems,
        factionName: undefined, // Extracted from JOINs
        locationName: undefined, // Extracted from JOINs
      };
    },
    enabled: !!npcId,
  });
}

// ============================================================================
// COMBAT STATS MUTATIONS
// ============================================================================

/**
 * Mutation: Upsert NPC combat stats
 */
export function useUpsertNPCCombatStatsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ npcId, command }: { npcId: string; command: UpsertNPCCombatStatsCommand }) =>
      upsertNPCCombatStats(npcId, command),

    onSuccess: (_, { npcId }) => {
      queryClient.invalidateQueries({ queryKey: ['npc', npcId, 'details'] });
      toast.success('Combat stats updated');
    },

    onError: (err) => {
      toast.error('Failed to update combat stats');
      console.error(err);
    },
  });
}

/**
 * Mutation: Delete NPC combat stats
 */
export function useDeleteNPCCombatStatsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (npcId: string) => deleteNPCCombatStats(npcId),

    onSuccess: (_, npcId) => {
      queryClient.invalidateQueries({ queryKey: ['npc', npcId, 'details'] });
      toast.success('Combat stats removed');
    },

    onError: (err) => {
      toast.error('Failed to remove combat stats');
      console.error(err);
    },
  });
}

// ============================================================================
// RELATIONSHIP MUTATIONS
// ============================================================================

/**
 * Mutation: Create NPC relationship
 */
export function useCreateNPCRelationshipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: CreateNPCRelationshipCommand) =>
      createNPCRelationship(command),

    onSuccess: (newRelationship) => {
      // Invalidate details for both NPCs (bidirectional)
      queryClient.invalidateQueries({ queryKey: ['npc', newRelationship.npc_id_1, 'details'] });
      queryClient.invalidateQueries({ queryKey: ['npc', newRelationship.npc_id_2, 'details'] });
      toast.success('Relationship created');
    },

    onError: (err) => {
      toast.error('Failed to create relationship');
      console.error(err);
    },
  });
}

/**
 * Mutation: Update NPC relationship
 */
export function useUpdateNPCRelationshipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ relationshipId, command }: { relationshipId: string; command: UpdateNPCRelationshipCommand }) =>
      updateNPCRelationship(relationshipId, command),

    onSuccess: (updatedRelationship) => {
      queryClient.invalidateQueries({ queryKey: ['npc', updatedRelationship.npc_id_1, 'details'] });
      queryClient.invalidateQueries({ queryKey: ['npc', updatedRelationship.npc_id_2, 'details'] });
      toast.success('Relationship updated');
    },

    onError: (err) => {
      toast.error('Failed to update relationship');
      console.error(err);
    },
  });
}

/**
 * Mutation: Delete NPC relationship
 */
export function useDeleteNPCRelationshipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (relationshipId: string) => deleteNPCRelationship(relationshipId),

    onSuccess: () => {
      // Invalidate all NPC details (don't know which NPCs involved)
      queryClient.invalidateQueries({ queryKey: ['npc'] });
      toast.success('Relationship deleted');
    },

    onError: (err) => {
      toast.error('Failed to delete relationship');
      console.error(err);
    },
  });
}
