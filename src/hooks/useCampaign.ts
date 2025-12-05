'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getCampaign } from '@/lib/api/campaigns';
import { getCharacterCards } from '@/lib/api/characters';
import type { CampaignDTO } from '@/types/campaigns';
import type { PlayerCharacterCardViewModel } from '@/types/player-characters';

/**
 * React Query hook for fetching a single campaign
 * Uses Direct Supabase calls via API helper functions
 */
export function useCampaignQuery(
  campaignId: string | null | undefined,
  options?: {
    enabled?: boolean;
  }
) {
  const router = useRouter();

  return useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async (): Promise<CampaignDTO> => {
      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }

      try {
        return await getCampaign(campaignId);
      } catch (error) {
        // If not found or unauthorized, handle appropriately
        if (error instanceof Error) {
          if (error.message.includes('not found')) {
            throw error; // Let component handle 404
          }
          if (error.message.includes('auth')) {
            router.push('/login');
          }
        }
        throw error;
      }
    },
    enabled: !!campaignId && (options?.enabled ?? true),
  });
}

/**
 * React Query hook for fetching characters in a campaign
 * Uses Direct Supabase calls via API helper functions
 */
export function useCampaignCharactersQuery(
  campaignId: string | null | undefined,
  options?: {
    enabled?: boolean;
  }
) {
  const router = useRouter();

  return useQuery({
    queryKey: ['campaign', campaignId, 'characters'],
    queryFn: async (): Promise<PlayerCharacterCardViewModel[]> => {
      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }

      try {
        return await getCharacterCards(campaignId);
      } catch (error) {
        // If unauthorized, redirect
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        // If not found, return empty array
        if (error instanceof Error && error.message.includes('not found')) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!campaignId && (options?.enabled ?? true),
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}
