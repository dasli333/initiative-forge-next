'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import type { CombatDTO } from '@/types';

/**
 * Fetch single combat by ID using Direct Supabase
 * @param combatId Combat UUID
 * @returns React Query result with combat data
 */
export function useCombat(combatId: string | null | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['combat', combatId],
    queryFn: async (): Promise<CombatDTO> => {
      if (!combatId) throw new Error('Combat ID is required');

      const supabase = getSupabaseClient();

      try {
        const { data, error } = await supabase
          .from('combats')
          .select('*')
          .eq('id', combatId)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Combat not found');

        return data as unknown as CombatDTO;
      } catch (error) {
        // Check for auth errors
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!combatId,
    staleTime: 0, // Always fresh (real-time state managed by Zustand)
    refetchOnWindowFocus: false, // Don't refetch on focus (we have Zustand)
  });
}
