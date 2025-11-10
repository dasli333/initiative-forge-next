import { useQuery } from '@tanstack/react-query';
import { searchCampaignEntities } from '@/lib/api/entities';
import { useState, useEffect } from 'react';

interface UseEntitiesSearchOptions {
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * React Query hook for searching campaign entities (with debounce)
 * @param campaignId - Campaign ID
 * @param query - Search query
 * @param options - Query options
 */
export function useEntitiesSearchQuery(
  campaignId: string,
  query: string,
  options?: UseEntitiesSearchOptions
) {
  const { enabled = true, debounceMs = 300 } = options || {};
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return useQuery({
    queryKey: ['entities', 'search', campaignId, debouncedQuery],
    queryFn: () => searchCampaignEntities(campaignId, debouncedQuery),
    enabled: enabled && !!campaignId && debouncedQuery.length >= 1,
    staleTime: 60 * 1000, // 1 minute
  });
}
