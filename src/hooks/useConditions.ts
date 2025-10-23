'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import type { Condition } from '@/types';

/**
 * Fetch all D&D 5e conditions using Direct Supabase
 * Conditions are static reference data, so we cache indefinitely
 * @returns React Query result with conditions array
 */
export function useConditions() {
  const router = useRouter();

  return useQuery({
    queryKey: ['conditions'],
    queryFn: async (): Promise<Condition[]> => {
      const supabase = getSupabaseClient();

      try {
        const { data, error } = await supabase
          .from('conditions')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

        return data as Condition[];
      } catch (error) {
        // Check for auth errors
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    staleTime: Infinity, // Conditions don't change
  });
}
