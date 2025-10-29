import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase";
import type { PlayerCharacterDTO } from "@/types";

/**
 * Hook for fetching player characters for a campaign
 * Uses TanStack Query (useQuery) with direct Supabase calls
 */
export function usePlayerCharacters(campaignId: string) {
  return useQuery({
    queryKey: ["player-characters", campaignId],
    queryFn: async () => {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("player_characters")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching player characters:", error);
        throw new Error("Failed to fetch player characters");
      }

      return data as unknown as PlayerCharacterDTO[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
