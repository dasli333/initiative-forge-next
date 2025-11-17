'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getFactions,
  getFaction,
  createFaction,
  updateFaction,
  deleteFaction,
} from '@/lib/api/factions';
import type { FactionDTO, CreateFactionCommand, UpdateFactionCommand } from '@/types/factions';

/**
 * React Query hook for fetching factions for a campaign
 */
export function useFactionsQuery(campaignId: string) {
  const router = useRouter();

  return useQuery({
    queryKey: ['factions', campaignId],
    queryFn: async (): Promise<FactionDTO[]> => {
      try {
        return await getFactions(campaignId);
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
 * React Query hook for fetching a single faction
 */
export function useFactionQuery(factionId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['faction', factionId],
    queryFn: async (): Promise<FactionDTO> => {
      if (!factionId) throw new Error('Faction ID is required');

      try {
        return await getFaction(factionId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!factionId,
  });
}

/**
 * Mutation hook for creating a new faction
 */
export function useCreateFactionMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreateFactionCommand): Promise<FactionDTO> => {
      try {
        return await createFaction(campaignId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (command) => {
      await queryClient.cancelQueries({ queryKey: ['factions', campaignId] });

      const previousFactions = queryClient.getQueryData<FactionDTO[]>(['factions', campaignId]);

      if (previousFactions) {
        const tempFaction: FactionDTO = {
          id: `temp-${Date.now()}`,
          campaign_id: campaignId,
          name: command.name,
          description_json: command.description_json || null,
          goals_json: command.goals_json || null,
          resources_json: command.resources_json || null,
          image_url: command.image_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData<FactionDTO[]>(['factions', campaignId], [...previousFactions, tempFaction]);
      }

      return { previousFactions };
    },
    onError: (err, _command, context) => {
      if (context?.previousFactions) {
        queryClient.setQueryData(['factions', campaignId], context.previousFactions);
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
      toast.success('Faction created', {
        description: 'Your faction has been created successfully.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['factions', campaignId] });
    },
  });
}

/**
 * Mutation hook for updating a faction
 */
export function useUpdateFactionMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, command }: { id: string; command: UpdateFactionCommand }): Promise<FactionDTO> => {
      try {
        return await updateFaction(id, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async ({ id, command }) => {
      await queryClient.cancelQueries({ queryKey: ['factions', campaignId] });
      await queryClient.cancelQueries({ queryKey: ['faction', id] });

      const previousFactions = queryClient.getQueryData<FactionDTO[]>(['factions', campaignId]);
      const previousFaction = queryClient.getQueryData<FactionDTO>(['faction', id]);

      if (previousFactions) {
        queryClient.setQueryData<FactionDTO[]>(
          ['factions', campaignId],
          previousFactions.map((f) => (f.id === id ? { ...f, ...command } as FactionDTO : f))
        );
      }

      if (previousFaction) {
        queryClient.setQueryData<FactionDTO>(['faction', id], {
          ...previousFaction,
          ...command,
        } as FactionDTO);
      }

      return { previousFactions, previousFaction };
    },
    onError: (err, variables, context) => {
      if (context?.previousFactions) {
        queryClient.setQueryData(['factions', campaignId], context.previousFactions);
      }
      if (context?.previousFaction) {
        queryClient.setQueryData(['faction', variables.id], context.previousFaction);
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
      toast.success('Faction updated', {
        description: 'Faction has been updated successfully.',
      });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['factions', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['faction', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['entity-preview', 'faction', variables.id] });
    },
  });
}

/**
 * Mutation hook for deleting a faction
 */
export function useDeleteFactionMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        await deleteFaction(id);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['factions', campaignId] });

      const previousFactions = queryClient.getQueryData<FactionDTO[]>(['factions', campaignId]);

      if (previousFactions) {
        queryClient.setQueryData<FactionDTO[]>(
          ['factions', campaignId],
          previousFactions.filter((f) => f.id !== id)
        );
      }

      return { previousFactions };
    },
    onError: (err, id, context) => {
      if (context?.previousFactions) {
        queryClient.setQueryData(['factions', campaignId], context.previousFactions);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : 'Failed to delete faction. Please try again.';

      toast.error('Error', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('Faction deleted', {
        description: 'Faction has been removed successfully.',
      });
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['factions', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['faction', id] });
    },
  });
}
