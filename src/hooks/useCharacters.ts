'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  getCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from '@/lib/api/characters';
import type {
  PlayerCharacter,
  CreatePlayerCharacterCommand,
  UpdatePlayerCharacterCommand,
} from '@/types';

/**
 * Hook for fetching player characters for a campaign
 */
export function useCharactersQuery(campaignId: string | null | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['campaigns', campaignId, 'characters'],
    queryFn: async (): Promise<PlayerCharacter[]> => {
      if (!campaignId) throw new Error('Campaign ID is required');

      try {
        return await getCharacters(campaignId);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('auth')) {
            router.push('/login');
          }
        }
        throw error;
      }
    },
    enabled: !!campaignId,
  });
}

/**
 * Hook for creating a new player character
 */
export function useCreateCharacterMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (command: CreatePlayerCharacterCommand) => {
      return await createCharacter(campaignId, command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['campaigns', campaignId, 'characters'],
      });
      toast.success('Character created successfully');
    },
    onError: (error: Error) => {
      if (error.message.includes('already exists')) {
        toast.error('A character with this name already exists');
      } else {
        toast.error('Failed to create character');
      }
      console.error('Error creating character:', error);
    },
  });
}

/**
 * Hook for updating a player character
 */
export function useUpdateCharacterMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      characterId,
      command,
    }: {
      characterId: string;
      command: UpdatePlayerCharacterCommand;
    }) => {
      return await updateCharacter(characterId, command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['campaigns', campaignId, 'characters'],
      });
      toast.success('Character updated successfully');
    },
    onError: (error: Error) => {
      if (error.message.includes('not found')) {
        toast.error('Character not found');
      } else {
        toast.error('Failed to update character');
      }
      console.error('Error updating character:', error);
    },
  });
}

/**
 * Hook for deleting a player character
 */
export function useDeleteCharacterMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (characterId: string) => {
      await deleteCharacter(characterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['campaigns', campaignId, 'characters'],
      });
      toast.success('Character deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete character');
      console.error('Error deleting character:', error);
    },
  });
}
