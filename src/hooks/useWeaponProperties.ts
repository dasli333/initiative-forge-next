'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getWeaponProperties } from '@/lib/api/weapon-properties';
import type { WeaponPropertyDTO } from '@/types';

/**
 * Fetch all D&D 5e weapon properties using Direct Supabase
 * Weapon properties are static reference data, so we cache indefinitely
 * @returns React Query result with weapon properties array
 */
export function useWeaponProperties() {
  const router = useRouter();

  return useQuery({
    queryKey: ['weapon-properties'],
    queryFn: async (): Promise<WeaponPropertyDTO[]> => {
      try {
        return await getWeaponProperties();
      } catch (error) {
        // Check for auth errors
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    staleTime: Infinity, // Weapon properties don't change
  });
}
