'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getEquipment, getEquipmentItem, type FetchEquipmentParams } from '@/lib/api/equipment';
import type { EquipmentDTO } from '@/types';

/**
 * Fetch D&D 5e equipment with optional filtering and pagination
 * @param params - Filter and pagination parameters
 * @returns React Query result with equipment array and pagination metadata
 */
export function useEquipment(params: FetchEquipmentParams = {}) {
  const router = useRouter();

  return useQuery({
    queryKey: ['equipment', params],
    queryFn: async () => {
      try {
        return await getEquipment(params);
      } catch (error) {
        // Check for auth errors
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - equipment data changes infrequently
  });
}

/**
 * Fetch a single equipment item by ID
 * @param equipmentId - Equipment UUID
 * @returns React Query result with single equipment item
 */
export function useEquipmentItem(equipmentId: string | null) {
  const router = useRouter();

  return useQuery({
    queryKey: ['equipment', equipmentId],
    queryFn: async (): Promise<EquipmentDTO | null> => {
      if (!equipmentId) return null;

      try {
        return await getEquipmentItem(equipmentId);
      } catch (error) {
        // Check for auth errors
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!equipmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
