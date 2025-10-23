import { useQuery } from "@tanstack/react-query";
import type { ListPlayerCharactersResponseDTO } from "@/types";

/**
 * Hook do pobierania postaci graczy dla kampanii
 * Używa TanStack Query (useQuery)
 */
export function usePlayerCharacters(campaignId: string) {
  return useQuery({
    queryKey: ["player-characters", campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/characters`);

      if (!response.ok) {
        throw new Error("Failed to fetch player characters");
      }

      const data: ListPlayerCharactersResponseDTO = await response.json();
      return data.characters;
    },
    staleTime: 5 * 60 * 1000, // 5 minut
  });
}
