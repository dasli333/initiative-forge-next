'use client';

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import type { Spell } from '@/types';

/**
 * Parameters for the useSpells hook
 */
export interface UseSpellsParams {
  searchQuery: string;
  type: string | null;
  size: string | null;
  alignment: string | null;
  limit: number;
}

/**
 * Response structure for list spells
 */
export interface ListSpellsResponseDTO {
  spells: Spell[];
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
          query = query.ilike('data->>name', `%${params.searchQuery}%`);
        }
        if (params.type) {
          query = query.eq('data->>type', params.type);
        }
        if (params.size) {
          query = query.eq('data->>size', params.size);
        }
        if (params.alignment) {
          query = query.eq('data->>alignment', params.alignment);
        }

        // Apply pagination
        query = query
          .range(pageParam as number, (pageParam as number) + params.limit - 1)
          .order('data->>name', { ascending: true });

        const { data, error, count } = await query;

        if (error) throw error;

        return {
          spells: (data as Spell[]) || [],
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
