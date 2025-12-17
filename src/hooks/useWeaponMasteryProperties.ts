'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getWeaponMasteryProperties } from '@/lib/api/weapon-mastery-properties';
import type { WeaponMasteryPropertyDTO } from '@/types';

/**
 * Fetch all D&D 5e weapon mastery properties using Direct Supabase
 * Weapon mastery properties are static reference data, so we cache indefinitely
 * @returns React Query result with weapon mastery properties array
 */
export function useWeaponMasteryProperties() {
  const router = useRouter();

  return useQuery({
    queryKey: ['weapon-mastery-properties'],
    queryFn: async (): Promise<WeaponMasteryPropertyDTO[]> => {
      try {
        return await getWeaponMasteryProperties();
      } catch (error) {
        // Check for auth errors
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    staleTime: Infinity, // Weapon mastery properties don't change
  });
}
