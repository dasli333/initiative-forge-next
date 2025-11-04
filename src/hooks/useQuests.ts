'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getQuests,
  getQuest,
  createQuest,
  updateQuest,
  deleteQuest,
} from '@/lib/api/quests';
import type { Quest, CreateQuestCommand, UpdateQuestCommand, QuestFilters } from '@/types/quests';

/**
 * React Query hook for fetching quests for a campaign
 */
export function useQuestsQuery(campaignId: string, filters?: QuestFilters) {
  const router = useRouter();

  return useQuery({
    queryKey: ['quests', campaignId, filters],
    queryFn: async (): Promise<Quest[]> => {
      try {
        return await getQuests(campaignId, filters);
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
 * React Query hook for fetching a single quest
 */
export function useQuestQuery(questId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['quest', questId],
    queryFn: async (): Promise<Quest> => {
      if (!questId) throw new Error('Quest ID is required');

      try {
        return await getQuest(questId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!questId,
  });
}

/**
 * Mutation hook for creating a new quest
 */
export function useCreateQuestMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreateQuestCommand): Promise<Quest> => {
      try {
        return await createQuest(campaignId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (command) => {
      await queryClient.cancelQueries({ queryKey: ['quests', campaignId] });

      const previousQuests = queryClient.getQueryData<Quest[]>(['quests', campaignId]);

      if (previousQuests) {
        const tempQuest: Quest = {
          id: `temp-${Date.now()}`,
          campaign_id: campaignId,
          story_arc_id: command.story_arc_id || null,
          title: command.title,
          description_json: command.description_json || null,
          objectives_json: command.objectives_json || null,
          rewards_json: command.rewards_json || null,
          status: command.status || 'not_started',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData<Quest[]>(['quests', campaignId], [...previousQuests, tempQuest]);
      }

      return { previousQuests };
    },
    onError: (err, _command, context) => {
      if (context?.previousQuests) {
        queryClient.setQueryData(['quests', campaignId], context.previousQuests);
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
      toast.success('Quest created', {
        description: 'Your quest has been created successfully.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['quests', campaignId] });
    },
  });
}

/**
 * Mutation hook for updating a quest
 */
export function useUpdateQuestMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, command }: { id: string; command: UpdateQuestCommand }): Promise<Quest> => {
      try {
        return await updateQuest(id, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async ({ id, command }) => {
      await queryClient.cancelQueries({ queryKey: ['quests', campaignId] });
      await queryClient.cancelQueries({ queryKey: ['quest', id] });

      const previousQuests = queryClient.getQueryData<Quest[]>(['quests', campaignId]);
      const previousQuest = queryClient.getQueryData<Quest>(['quest', id]);

      if (previousQuests) {
        queryClient.setQueryData<Quest[]>(
          ['quests', campaignId],
          previousQuests.map((q) => (q.id === id ? { ...q, ...command } : q))
        );
      }

      if (previousQuest) {
        queryClient.setQueryData<Quest>(['quest', id], {
          ...previousQuest,
          ...command,
        });
      }

      return { previousQuests, previousQuest };
    },
    onError: (err, variables, context) => {
      if (context?.previousQuests) {
        queryClient.setQueryData(['quests', campaignId], context.previousQuests);
      }
      if (context?.previousQuest) {
        queryClient.setQueryData(['quest', variables.id], context.previousQuest);
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
      toast.success('Quest updated', {
        description: 'Quest has been updated successfully.',
      });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quests', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['quest', variables.id] });
    },
  });
}

/**
 * Mutation hook for deleting a quest
 */
export function useDeleteQuestMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        await deleteQuest(id);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['quests', campaignId] });

      const previousQuests = queryClient.getQueryData<Quest[]>(['quests', campaignId]);

      if (previousQuests) {
        queryClient.setQueryData<Quest[]>(
          ['quests', campaignId],
          previousQuests.filter((q) => q.id !== id)
        );
      }

      return { previousQuests };
    },
    onError: (err, id, context) => {
      if (context?.previousQuests) {
        queryClient.setQueryData(['quests', campaignId], context.previousQuests);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : 'Failed to delete quest. Please try again.';

      toast.error('Error', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('Quest deleted', {
        description: 'Quest has been removed successfully.',
      });
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['quests', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['quest', id] });
    },
  });
}
