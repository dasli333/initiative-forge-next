'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getNPCCombatStats,
  upsertNPCCombatStats,
  deleteNPCCombatStats,
} from '@/lib/api/npc-combat-stats';
import type { NPCCombatStatsDTO, UpsertNPCCombatStatsCommand } from '@/types/npc-combat-stats';

/**
 * React Query hook for fetching NPC combat stats
 * Returns null if no combat stats exist
 */
export function useNPCCombatStatsQuery(npcId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['npc-combat-stats', npcId],
    queryFn: async (): Promise<NPCCombatStatsDTO | null> => {
      if (!npcId) throw new Error('NPC ID is required');

      try {
        return await getNPCCombatStats(npcId);
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
 * Mutation hook for upserting NPC combat stats
 * Creates if doesn't exist, updates if exists
 */
export function useUpsertNPCCombatStatsMutation(npcId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: UpsertNPCCombatStatsCommand): Promise<NPCCombatStatsDTO> => {
      try {
        return await upsertNPCCombatStats(npcId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (command) => {
      await queryClient.cancelQueries({ queryKey: ['npc-combat-stats', npcId] });

      const previousStats = queryClient.getQueryData<NPCCombatStatsDTO | null>(['npc-combat-stats', npcId]);

      // Optimistically update
      const tempStats: NPCCombatStatsDTO = {
        npc_id: npcId,
        hp_max: command.hp_max,
        armor_class: command.armor_class,
        speed: command.speed,
        strength: command.strength,
        dexterity: command.dexterity,
        constitution: command.constitution,
        intelligence: command.intelligence,
        wisdom: command.wisdom,
        charisma: command.charisma,
        actions_json: command.actions_json || null,
        traits_json: command.traits_json || null,
        bonus_actions_json: command.bonus_actions_json || null,
        reactions_json: command.reactions_json || null,
        legendary_actions_json: command.legendary_actions_json || null,
        damage_vulnerabilities: command.damage_vulnerabilities || null,
        damage_resistances: command.damage_resistances || null,
        damage_immunities: command.damage_immunities || null,
        condition_immunities: command.condition_immunities || null,
        gear: command.gear || null,
        created_at: previousStats?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<NPCCombatStatsDTO>(['npc-combat-stats', npcId], tempStats);

      return { previousStats };
    },
    onError: (err, _command, context) => {
      if (context?.previousStats !== undefined) {
        queryClient.setQueryData(['npc-combat-stats', npcId], context.previousStats);
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
      toast.success('Combat stats saved', {
        description: 'NPC combat stats have been saved successfully.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['npc-combat-stats', npcId] });
    },
  });
}

/**
 * Mutation hook for deleting NPC combat stats
 */
export function useDeleteNPCCombatStatsMutation(npcId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await deleteNPCCombatStats(npcId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['npc-combat-stats', npcId] });

      const previousStats = queryClient.getQueryData<NPCCombatStatsDTO | null>(['npc-combat-stats', npcId]);

      // Optimistically set to null
      queryClient.setQueryData<NPCCombatStatsDTO | null>(['npc-combat-stats', npcId], null);

      return { previousStats };
    },
    onError: (err, _variables, context) => {
      if (context?.previousStats !== undefined) {
        queryClient.setQueryData(['npc-combat-stats', npcId], context.previousStats);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : 'Failed to delete combat stats. Please try again.';

      toast.error('Error', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('Combat stats deleted', {
        description: 'NPC combat stats have been removed successfully.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['npc-combat-stats', npcId] });
    },
  });
}
