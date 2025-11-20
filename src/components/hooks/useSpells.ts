'use client';

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import type { SpellDTO } from '@/types';

/**
 * Parameters for the useSpells hook
 */
export interface UseSpellsParams {
  searchQuery: string;
  level: number | null;
  class: string | null;
  limit: number;
}

/**
 * Response structure for list spells
 */
export interface ListSpellsResponseDTO {
  spells: SpellDTO[];
  total: number;
}

/**
 * React Query infinite query hook for fetching paginated spells using Direct Supabase
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
export function useSpells(params: UseSpellsParams) {
  const router = useRouter();

  return useInfiniteQuery<ListSpellsResponseDTO, Error>({
    queryKey: ["spells", params],
    queryFn: async ({ pageParam = 0 }) => {
      const supabase = getSupabaseClient();

      try {
        // Build query
        let query = supabase
          .from('spells')
          .select('*', { count: 'exact' });

        // Apply filters
        if (params.searchQuery) {
          query = query.or(`data->>name.ilike.%${params.searchQuery}%,data->name->>en.ilike.%${params.searchQuery}%,data->name->>pl.ilike.%${params.searchQuery}%`);
        }
        if (params.level !== null) {
          query = query.eq('data->>level', String(params.level));
        }
        if (params.class) {
          // Filter by class using JSONB contains operator with JSON array
          query = query.filter('data->classes', 'cs', JSON.stringify([params.class]));
        }

        // Apply pagination
        query = query
          .range(pageParam as number, (pageParam as number) + params.limit - 1)
          .order('data->>level', { ascending: true })
          .order('data->name->>en', { ascending: true });

        const { data, error, count } = await query;

        if (error) throw error;

        return {
          spells: (data as unknown as SpellDTO[]) || [],
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
      const loadedCount = allPages.reduce((sum, page) => sum + page.spells.length, 0);
      // Return next offset if there are more spells to load
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
}
