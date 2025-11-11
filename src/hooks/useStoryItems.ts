'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getStoryItems,
  getStoryItem,
  createStoryItem,
  updateStoryItem,
  deleteStoryItem,
} from '@/lib/api/story-items';
import type { StoryItemDTO, CreateStoryItemCommand, UpdateStoryItemCommand, StoryItemFilters } from '@/types/story-items';

export function useStoryItemsQuery(campaignId: string, filters?: StoryItemFilters) {
  const router = useRouter();

  return useQuery({
    queryKey: ['story-items', campaignId, filters],
    queryFn: async (): Promise<StoryItemDTO[]> => {
      try {
        return await getStoryItems(campaignId, filters);
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

export function useStoryItemQuery(storyItemId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['story-item', storyItemId],
    queryFn: async (): Promise<StoryItemDTO> => {
      if (!storyItemId) throw new Error('Story item ID is required');

      try {
        return await getStoryItem(storyItemId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!storyItemId,
  });
}

export function useCreateStoryItemMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreateStoryItemCommand): Promise<StoryItemDTO> => {
      try {
        return await createStoryItem(campaignId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-items', campaignId] });
      toast.success('Story item created');
    },
    onError: (err) => {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Failed to create story item' });
    },
  });
}

export function useUpdateStoryItemMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, command }: { id: string; command: UpdateStoryItemCommand }): Promise<StoryItemDTO> => {
      try {
        return await updateStoryItem(id, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['story-items', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['story-item', variables.id] });
      toast.success('Story item updated');
    },
    onError: (err) => {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Failed to update story item' });
    },
  });
}

export function useDeleteStoryItemMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        await deleteStoryItem(id);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['story-items', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['story-item', id] });
      toast.success('Story item deleted');
    },
    onError: () => {
      toast.error('Failed to delete story item');
    },
  });
}
