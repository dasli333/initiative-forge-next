'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getSupabaseClient } from '@/lib/supabase';
import type { ListCombatsResponseDTO, CombatSummaryDTO, CombatSnapshotDTO } from '@/types';

/**
 * Get all combats for a campaign (Direct Supabase)
 */
async function getCombats(campaignId: string): Promise<ListCombatsResponseDTO> {
  const supabase = getSupabaseClient();

  // Build query
  const { data, error, count } = await supabase
    .from('combats')
    .select('*', { count: 'exact' })
    .eq('campaign_id', campaignId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error listing combats:', error);
    throw new Error(error.message);
  }

  // Transform to CombatSummaryDTO
  const combats: CombatSummaryDTO[] = (data || []).map((combat) => {
    const snapshot = combat.state_snapshot as unknown as CombatSnapshotDTO;
    const participantCount = snapshot?.participants?.length || 0;

    return {
      id: combat.id,
      campaign_id: combat.campaign_id,
      name: combat.name,
      status: combat.status as 'active' | 'completed',
      current_round: combat.current_round || 1,
      participant_count: participantCount,
      created_at: combat.created_at,
      updated_at: combat.updated_at || combat.created_at,
    };
  });

  return {
    combats,
    total: count || 0,
    limit: 50,
    offset: 0,
  };
}

/**
 * Delete a combat (Direct Supabase)
 */
async function deleteCombat(combatId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from('combats').delete().eq('id', combatId);

  if (error) {
    console.error('Error deleting combat:', error);
    throw new Error(error.message);
  }
}

/**
 * Hook for fetching combats list for a campaign
 */
export function useCombatsQuery(campaignId: string | null | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['combats', campaignId],
    queryFn: async (): Promise<ListCombatsResponseDTO> => {
      if (!campaignId) throw new Error('Campaign ID is required');

      try {
        return await getCombats(campaignId);
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
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook for deleting a combat
 */
export function useDeleteCombatMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (combatId: string) => {
      await deleteCombat(combatId);
    },

    // Optimistic update
    onMutate: async (combatId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['combats', campaignId] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<ListCombatsResponseDTO>(['combats', campaignId]);

      // Optimistically update to remove combat
      if (previousData) {
        queryClient.setQueryData<ListCombatsResponseDTO>(['combats', campaignId], {
          ...previousData,
          combats: previousData.combats.filter((c) => c.id !== combatId),
          total: previousData.total - 1,
        });
      }

      return { previousData };
    },

    // Rollback on error
    onError: (error, combatId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['combats', campaignId], context.previousData);
      }
      toast.error('Failed to delete combat');
      console.error('Error deleting combat:', error);
    },

    // Success notification
    onSuccess: () => {
      toast.success('Combat deleted successfully');
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['combats', campaignId] });
    },
  });
}
