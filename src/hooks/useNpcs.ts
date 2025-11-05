'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getNPCs,
  getNPC,
  createNPC,
  updateNPC,
  deleteNPC,
} from '@/lib/api/npcs';
import type { NPCSDTO, CreateNPCCommand, UpdateNPCCommand, NPCFilters } from '@/types/npcs';

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
