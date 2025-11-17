'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getStoryArcs,
  getStoryArc,
  createStoryArc,
  updateStoryArc,
  deleteStoryArc,
} from '@/lib/api/story-arcs';
import type { StoryArcDTO, CreateStoryArcCommand, UpdateStoryArcCommand, StoryArcFilters } from '@/types/story-arcs';

/**
 * React Query hook for fetching story arcs for a campaign
 */
export function useStoryArcsQuery(campaignId: string, filters?: StoryArcFilters) {
  const router = useRouter();

  return useQuery({
    queryKey: ['story-arcs', campaignId, filters],
    queryFn: async (): Promise<StoryArcDTO[]> => {
      try {
        return await getStoryArcs(campaignId, filters);
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
 * React Query hook for fetching a single story arc
 */
export function useStoryArcQuery(storyArcId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['story-arc', storyArcId],
    queryFn: async (): Promise<StoryArcDTO> => {
      if (!storyArcId) throw new Error('Story arc ID is required');

      try {
        return await getStoryArc(storyArcId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!storyArcId,
  });
}

/**
 * Mutation hook for creating a new story arc
 */
export function useCreateStoryArcMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreateStoryArcCommand): Promise<StoryArcDTO> => {
      try {
        return await createStoryArc(campaignId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (command) => {
      await queryClient.cancelQueries({ queryKey: ['story-arcs', campaignId] });

      const previousArcs = queryClient.getQueryData<StoryArcDTO[]>(['story-arcs', campaignId]);

      if (previousArcs) {
        const tempArc: StoryArcDTO = {
          id: `temp-${Date.now()}`,
          campaign_id: campaignId,
          title: command.title,
          description_json: command.description_json || null,
          status: command.status || 'planning',
          start_date: command.start_date || null,
          end_date: command.end_date || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData<StoryArcDTO[]>(['story-arcs', campaignId], [...previousArcs, tempArc]);
      }

      return { previousArcs };
    },
    onError: (err, _command, context) => {
      if (context?.previousArcs) {
        queryClient.setQueryData(['story-arcs', campaignId], context.previousArcs);
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
      toast.success('Story arc created', {
        description: 'Your story arc has been created successfully.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['story-arcs', campaignId] });
    },
  });
}

/**
 * Mutation hook for updating a story arc
 */
export function useUpdateStoryArcMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, command }: { id: string; command: UpdateStoryArcCommand }): Promise<StoryArcDTO> => {
      try {
        return await updateStoryArc(id, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async ({ id, command }) => {
      await queryClient.cancelQueries({ queryKey: ['story-arcs', campaignId] });
      await queryClient.cancelQueries({ queryKey: ['story-arc', id] });

      const previousArcs = queryClient.getQueryData<StoryArcDTO[]>(['story-arcs', campaignId]);
      const previousArc = queryClient.getQueryData<StoryArcDTO>(['story-arc', id]);

      if (previousArcs) {
        queryClient.setQueryData<StoryArcDTO[]>(
          ['story-arcs', campaignId],
          previousArcs.map((arc) => (arc.id === id ? { ...arc, ...command } as StoryArcDTO : arc))
        );
      }

      if (previousArc) {
        queryClient.setQueryData<StoryArcDTO>(['story-arc', id], {
          ...previousArc,
          ...command,
        } as StoryArcDTO);
      }

      return { previousArcs, previousArc };
    },
    onError: (err, variables, context) => {
      if (context?.previousArcs) {
        queryClient.setQueryData(['story-arcs', campaignId], context.previousArcs);
      }
      if (context?.previousArc) {
        queryClient.setQueryData(['story-arc', variables.id], context.previousArc);
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
      toast.success('Story arc updated', {
        description: 'Story arc has been updated successfully.',
      });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['story-arcs', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['story-arc', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['entity-preview', 'story_arc', variables.id] });
    },
  });
}

/**
 * Mutation hook for deleting a story arc
 */
export function useDeleteStoryArcMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        await deleteStoryArc(id);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['story-arcs', campaignId] });

      const previousArcs = queryClient.getQueryData<StoryArcDTO[]>(['story-arcs', campaignId]);

      if (previousArcs) {
        queryClient.setQueryData<StoryArcDTO[]>(
          ['story-arcs', campaignId],
          previousArcs.filter((arc) => arc.id !== id)
        );
      }

      return { previousArcs };
    },
    onError: (err, id, context) => {
      if (context?.previousArcs) {
        queryClient.setQueryData(['story-arcs', campaignId], context.previousArcs);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : 'Failed to delete story arc. Please try again.';

      toast.error('Error', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('Story arc deleted', {
        description: 'Story arc has been removed successfully.',
      });
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['story-arcs', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['story-arc', id] });
    },
  });
}
