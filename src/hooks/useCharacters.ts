'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  getCharacterCards,
  getCharacterDetails,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  addCombatStats,
  updateCombatStats,
  removeCombatStats,
  createPCNPCRelationship,
  updatePCNPCRelationship,
  deletePCNPCRelationship,
} from '@/lib/api/characters';
import type {
  PlayerCharacterCardViewModel,
  PlayerCharacterDetailsViewModel,
  PlayerCharacterFilters,
  CreatePlayerCharacterCommand,
  UpdatePlayerCharacterCommand,
  CreateCombatStatsCommand,
  UpdateCombatStatsCommand,
  CreatePCNPCRelationshipCommand,
  UpdatePCNPCRelationshipCommand,
} from '@/types/player-characters';

// ============================================================================
// CHARACTER CARDS QUERY (LIST VIEW)
// ============================================================================

/**
 * Query: Get character cards for campaign with optional filters
 */
export function useCharacterCardsQuery(campaignId: string, filters?: PlayerCharacterFilters) {
  const router = useRouter();

  return useQuery({
    queryKey: ['player_characters', campaignId, 'cards', filters],
    queryFn: async (): Promise<PlayerCharacterCardViewModel[]> => {
      try {
        return await getCharacterCards(campaignId, filters);
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

// ============================================================================
// CHARACTER DETAILS QUERY
// ============================================================================

/**
 * Query: Get full character details (character + combat stats + relationships)
 */
export function useCharacterDetailsQuery(
  characterId: string | null
): UseQueryResult<PlayerCharacterDetailsViewModel, Error> {
  return useQuery({
    queryKey: ['player_character', characterId, 'details'],
    queryFn: async () => {
      if (!characterId) throw new Error('Character ID is required');
      return await getCharacterDetails(characterId);
    },
    enabled: !!characterId,
  });
}

// ============================================================================
// CHARACTER MUTATIONS
// ============================================================================

/**
 * Mutation: Create new character
 */
export function useCreateCharacterMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreatePlayerCharacterCommand) => {
      try {
        return await createCharacter(campaignId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player_characters', campaignId] });
      toast.success('Character created');
    },
    onError: (error: Error) => {
      if (error.message.includes('already exists')) {
        toast.error('Character with this name already exists');
      } else {
        toast.error('Failed to create character');
      }
    },
  });
}

/**
 * Mutation: Update character
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
    }) => updateCharacter(characterId, command),

    onSuccess: (data, { characterId }) => {
      queryClient.invalidateQueries({ queryKey: ['player_characters', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['player_character', characterId] });
      toast.success('Character updated');
    },

    onError: (error: Error) => {
      if (error.message.includes('not found')) {
        toast.error('Character not found');
      } else {
        toast.error('Failed to update character');
      }
    },
  });
}

/**
 * Mutation: Delete character
 */
export function useDeleteCharacterMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (characterId: string) => deleteCharacter(characterId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player_characters', campaignId] });
      toast.success('Character deleted');
    },

    onError: () => {
      toast.error('Failed to delete character');
    },
  });
}

// ============================================================================
// COMBAT STATS MUTATIONS
// ============================================================================

/**
 * Mutation: Add combat stats
 */
export function useAddCombatStatsMutation(campaignId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ characterId, command }: { characterId: string; command: CreateCombatStatsCommand }) =>
      addCombatStats(characterId, command),

    onSuccess: (_, { characterId }) => {
      queryClient.invalidateQueries({ queryKey: ['player_character', characterId, 'details'] });
      if (campaignId) {
        queryClient.invalidateQueries({ queryKey: ['player_characters', campaignId] });
      }
      toast.success('Combat stats added');
    },

    onError: () => {
      toast.error('Failed to add combat stats');
    },
  });
}

/**
 * Mutation: Update combat stats
 */
export function useUpdateCombatStatsMutation(campaignId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ characterId, command }: { characterId: string; command: UpdateCombatStatsCommand }) =>
      updateCombatStats(characterId, command),

    onSuccess: (_, { characterId }) => {
      queryClient.invalidateQueries({ queryKey: ['player_character', characterId, 'details'] });
      if (campaignId) {
        queryClient.invalidateQueries({ queryKey: ['player_characters', campaignId] });
      }
      toast.success('Combat stats updated');
    },

    onError: () => {
      toast.error('Failed to update combat stats');
    },
  });
}

/**
 * Mutation: Remove combat stats
 */
export function useRemoveCombatStatsMutation(campaignId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (characterId: string) => removeCombatStats(characterId),

    onSuccess: (_, characterId) => {
      queryClient.invalidateQueries({ queryKey: ['player_character', characterId, 'details'] });
      if (campaignId) {
        queryClient.invalidateQueries({ queryKey: ['player_characters', campaignId] });
      }
      toast.success('Combat stats removed');
    },

    onError: () => {
      toast.error('Failed to remove combat stats');
    },
  });
}

// ============================================================================
// PC-NPC RELATIONSHIP MUTATIONS
// ============================================================================

/**
 * Mutation: Create PC-NPC relationship
 */
export function useCreatePCNPCRelationshipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ characterId, command }: { characterId: string; command: CreatePCNPCRelationshipCommand }) =>
      createPCNPCRelationship(characterId, command),

    onSuccess: (_, { characterId }) => {
      queryClient.invalidateQueries({ queryKey: ['player_character', characterId, 'details'] });
      toast.success('Relationship created');
    },

    onError: (error: Error) => {
      if (error.message.includes('already exists')) {
        toast.error('Relationship already exists');
      } else {
        toast.error('Failed to create relationship');
      }
    },
  });
}

/**
 * Mutation: Update PC-NPC relationship
 */
export function useUpdatePCNPCRelationshipMutation(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ relationshipId, command }: { relationshipId: string; command: UpdatePCNPCRelationshipCommand }) =>
      updatePCNPCRelationship(relationshipId, command),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player_character', characterId, 'details'] });
      toast.success('Relationship updated');
    },

    onError: () => {
      toast.error('Failed to update relationship');
    },
  });
}

/**
 * Mutation: Delete PC-NPC relationship
 */
export function useDeletePCNPCRelationshipMutation(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (relationshipId: string) => deletePCNPCRelationship(relationshipId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player_character', characterId, 'details'] });
      toast.success('Relationship deleted');
    },

    onError: () => {
      toast.error('Failed to delete relationship');
    },
  });
}
