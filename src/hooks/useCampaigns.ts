'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCampaignStore } from '@/stores/campaignStore';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from '@/lib/api/campaigns';
import { transformToCampaignViewModels } from '@/lib/utils/campaignTransformers';
import type { Campaign } from '@/types';
import type { CampaignViewModel } from '@/types/campaigns';

/**
 * React Query hook for fetching campaigns
 * Uses Direct Supabase calls via API helper functions
 */
export function useCampaignsQuery() {
  const router = useRouter();

  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async (): Promise<CampaignViewModel[]> => {
      try {
        const campaigns = await getCampaigns();
        return transformToCampaignViewModels(campaigns);
      } catch (error) {
        // If unauthorized, redirect to login
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
  });
}

/**
 * Mutation hook for creating a new campaign
 */
export function useCreateCampaignMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (name: string): Promise<Campaign> => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error('Campaign name is required');
      }

      try {
        return await createCampaign({ name: trimmedName });
      } catch (error) {
        // If unauthorized, redirect to login
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (name) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['campaigns'] });

      // Snapshot the previous value
      const previousCampaigns = queryClient.getQueryData<CampaignViewModel[]>(['campaigns']);

      // Optimistically update to the new value
      if (previousCampaigns) {
        const tempCampaign: CampaignViewModel = {
          id: `temp-${Date.now()}`,
          user_id: '',
          name: name.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          characterCount: 0,
          combatCount: 0,
          hasActiveCombat: false,
        };

        queryClient.setQueryData<CampaignViewModel[]>(['campaigns'], [...previousCampaigns, tempCampaign]);
      }

      // Return context with the snapshot
      return { previousCampaigns };
    },
    onError: (err, _name, context) => {
      // Rollback to the previous value on error
      if (context?.previousCampaigns) {
        queryClient.setQueryData(['campaigns'], context.previousCampaigns);
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
      toast.success('Campaign created', {
        description: 'Your campaign has been created successfully.',
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

/**
 * Mutation hook for updating a campaign
 */
export function useUpdateCampaignMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }): Promise<Campaign> => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error('Campaign name cannot be empty');
      }

      try {
        return await updateCampaign(id, { name: trimmedName });
      } catch (error) {
        // If unauthorized, redirect to login
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async ({ id, name }) => {
      // Cancel any outgoing refetches for both list and individual campaign
      await queryClient.cancelQueries({ queryKey: ['campaigns'] });
      await queryClient.cancelQueries({ queryKey: ['campaign', id] });

      // Snapshot the previous values
      const previousCampaigns = queryClient.getQueryData<CampaignViewModel[]>(['campaigns']);
      const previousCampaign = queryClient.getQueryData<Campaign>(['campaign', id]);

      // Optimistically update the campaigns list
      if (previousCampaigns) {
        queryClient.setQueryData<CampaignViewModel[]>(
          ['campaigns'],
          previousCampaigns.map((c) => (c.id === id ? { ...c, name: name.trim() } : c))
        );
      }

      // Optimistically update the individual campaign
      if (previousCampaign) {
        queryClient.setQueryData<Campaign>(['campaign', id], {
          ...previousCampaign,
          name: name.trim(),
        });
      }

      // Return context with the snapshots
      return { previousCampaigns, previousCampaign };
    },
    onError: (err, variables, context) => {
      // Rollback to the previous values on error
      if (context?.previousCampaigns) {
        queryClient.setQueryData(['campaigns'], context.previousCampaigns);
      }
      if (context?.previousCampaign) {
        queryClient.setQueryData(['campaign', variables.id], context.previousCampaign);
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
      toast.success('Campaign updated', {
        description: 'Campaign name has been updated successfully.',
      });
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.id] });
    },
  });
}

/**
 * Mutation hook for deleting a campaign
 */
export function useDeleteCampaignMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { selectedCampaignId, setSelectedCampaignId } = useCampaignStore();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        await deleteCampaign(id);
      } catch (error) {
        // If unauthorized, redirect to login
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['campaigns'] });

      // Snapshot the previous value
      const previousCampaigns = queryClient.getQueryData<CampaignViewModel[]>(['campaigns']);

      // Optimistically update by removing the campaign
      if (previousCampaigns) {
        queryClient.setQueryData<CampaignViewModel[]>(
          ['campaigns'],
          previousCampaigns.filter((c) => c.id !== id)
        );
      }

      // Clear selection if deleted campaign was selected
      const previousSelectedId = selectedCampaignId;
      if (selectedCampaignId === id) {
        setSelectedCampaignId(null);
      }

      // Return context with snapshots
      return { previousCampaigns, previousSelectedId };
    },
    onError: (err, id, context) => {
      // Rollback campaigns
      if (context?.previousCampaigns) {
        queryClient.setQueryData(['campaigns'], context.previousCampaigns);
      }

      // Rollback selected campaign ID
      if (context?.previousSelectedId === id) {
        setSelectedCampaignId(id);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : 'Failed to delete campaign. Please try again.';

      toast.error('Error', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('Campaign deleted', {
        description: 'Campaign has been removed successfully.',
      });
    },
    onSettled: (_data, _error, id) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    },
  });
}
