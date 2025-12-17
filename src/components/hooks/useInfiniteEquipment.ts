'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import type { EquipmentDTO } from '@/types';

/**
 * Parameters for the useInfiniteEquipment hook
 */
export interface UseInfiniteEquipmentParams {
  searchQuery: string;
  category: string | null;
  limit: number;
}

/**
 * Response structure for list equipment
 */
export interface ListEquipmentResponseDTO {
  equipment: EquipmentDTO[];
  total: number;
}

/**
 * React Query infinite query hook for fetching paginated equipment using Direct Supabase
 *
 * Automatically handles:
 * - Pagination with infinite scroll
 * - Caching (1 hour stale time)
 * - Refetching when filters change
 * - Loading and error states
 *
 * @param params - Filter and pagination parameters
 * @returns React Query infinite query result
 */
export function useInfiniteEquipment(params: UseInfiniteEquipmentParams) {
  const router = useRouter();

  return useInfiniteQuery<ListEquipmentResponseDTO, Error>({
    queryKey: ['equipment-infinite', params],
    queryFn: async ({ pageParam = 0 }) => {
      const supabase = getSupabaseClient();

      try {
        // Build query
        let query = supabase.from('equipment').select('*', { count: 'exact' });

        // Apply filters
        if (params.searchQuery) {
          query = query.or(
            `name.ilike.%${params.searchQuery}%,data->name->>en.ilike.%${params.searchQuery}%,data->name->>pl.ilike.%${params.searchQuery}%`
          );
        }
        if (params.category) {
          // Filter by category using JSONB contains operator
          query = query.contains('data->equipment_categories', [{ id: params.category }]);
        }

        // Apply pagination
        query = query
          .range(pageParam as number, (pageParam as number) + params.limit - 1)
          .order('name', { ascending: true });

        const { data, error, count } = await query;

        if (error) throw error;

        return {
          equipment: (data as unknown as EquipmentDTO[]) || [],
          total: count || 0,
        };
      } catch (error) {
        // Check for auth errors
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((sum, page) => sum + page.equipment.length, 0);
      // Return next offset if there are more equipment to load
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
}
