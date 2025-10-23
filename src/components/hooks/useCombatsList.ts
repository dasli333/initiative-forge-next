import { useQuery } from "@tanstack/react-query";
import type { ListCombatsResponseDTO } from "@/types";

export function useCombatsList(campaignId: string) {
  return useQuery({
    queryKey: ["combats", campaignId],
    queryFn: async (): Promise<ListCombatsResponseDTO> => {
      const response = await fetch(`/api/campaigns/${campaignId}/combats`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch combats");
      }

      return response.json();
    },
    staleTime: 30000, // 30 seconds
  });
}
