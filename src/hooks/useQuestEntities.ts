'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getQuestEntities,
  getQuestsByEntity,
  addQuestEntity,
  updateQuestEntity,
  removeQuestEntity,
} from '@/lib/api/quest-entities';
import type { QuestEntity, AddQuestEntityCommand, UpdateQuestEntityCommand } from '@/types/quest-entities';

/**
 * React Query hook for fetching entities linked to a quest
 */
export function useQuestEntitiesQuery(questId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['quest-entities', questId],
    queryFn: async (): Promise<QuestEntity[]> => {
      if (!questId) throw new Error('Quest ID is required');

      try {
        return await getQuestEntities(questId);
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
 * React Query hook for fetching quests linked to an entity (backlinks)
 */
export function useQuestsByEntityQuery(entityType: string | undefined, entityId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['quests-by-entity', entityType, entityId],
    queryFn: async (): Promise<QuestEntity[]> => {
      if (!entityType || !entityId) throw new Error('Entity type and ID are required');

      try {
        return await getQuestsByEntity(entityType, entityId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!entityType && !!entityId,
  });
}

/**
 * Mutation hook for adding an entity to a quest
 */
export function useAddQuestEntityMutation(questId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: AddQuestEntityCommand): Promise<QuestEntity> => {
      try {
        return await addQuestEntity(questId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (command) => {
      await queryClient.cancelQueries({ queryKey: ['quest-entities', questId] });

      const previousEntities = queryClient.getQueryData<QuestEntity[]>(['quest-entities', questId]);

      if (previousEntities) {
        const tempEntity: QuestEntity = {
          quest_id: questId,
          entity_type: command.entity_type,
          entity_id: command.entity_id,
          role: command.role || null,
        };

        queryClient.setQueryData<QuestEntity[]>(['quest-entities', questId], [...previousEntities, tempEntity]);
      }

      return { previousEntities };
    },
    onError: (err, _command, context) => {
      if (context?.previousEntities) {
        queryClient.setQueryData(['quest-entities', questId], context.previousEntities);
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
      toast.success('Entity linked', {
        description: 'Entity has been linked to the quest successfully.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['quest-entities', questId] });
    },
  });
}

/**
 * Mutation hook for updating a quest entity role
 */
export function useUpdateQuestEntityMutation(questId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      entityType,
      entityId,
      command
    }: {
      entityType: string;
      entityId: string;
      command: UpdateQuestEntityCommand
    }): Promise<QuestEntity> => {
      try {
        return await updateQuestEntity(questId, entityType, entityId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async ({ entityType, entityId, command }) => {
      await queryClient.cancelQueries({ queryKey: ['quest-entities', questId] });

      const previousEntities = queryClient.getQueryData<QuestEntity[]>(['quest-entities', questId]);

      if (previousEntities) {
        queryClient.setQueryData<QuestEntity[]>(
          ['quest-entities', questId],
          previousEntities.map((e) =>
            e.entity_type === entityType && e.entity_id === entityId
              ? { ...e, ...command }
              : e
          )
        );
      }

      return { previousEntities };
    },
    onError: (err, _variables, context) => {
      if (context?.previousEntities) {
        queryClient.setQueryData(['quest-entities', questId], context.previousEntities);
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
      toast.success('Entity role updated', {
        description: 'Quest entity role has been updated successfully.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['quest-entities', questId] });
    },
  });
}

/**
 * Mutation hook for removing an entity from a quest
 */
export function useRemoveQuestEntityMutation(questId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ entityType, entityId }: { entityType: string; entityId: string }): Promise<void> => {
      try {
        await removeQuestEntity(questId, entityType, entityId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async ({ entityType, entityId }) => {
      await queryClient.cancelQueries({ queryKey: ['quest-entities', questId] });

      const previousEntities = queryClient.getQueryData<QuestEntity[]>(['quest-entities', questId]);

      if (previousEntities) {
        queryClient.setQueryData<QuestEntity[]>(
          ['quest-entities', questId],
          previousEntities.filter((e) => !(e.entity_type === entityType && e.entity_id === entityId))
        );
      }

      return { previousEntities };
    },
    onError: (err, _variables, context) => {
      if (context?.previousEntities) {
        queryClient.setQueryData(['quest-entities', questId], context.previousEntities);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : 'Failed to remove entity from quest. Please try again.';

      toast.error('Error', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('Entity unlinked', {
        description: 'Entity has been removed from the quest successfully.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['quest-entities', questId] });
    },
  });
}
