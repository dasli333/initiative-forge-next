import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase";

/**
 * Player character with joined combat stats from Supabase query
 */
interface PCWithCombatStats {
  id: string;
  name: string;
  player_character_combat_stats?: {
    hp_max: number;
    armor_class: number;
  } | null;
}

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
        .select(`
          id,
          name,
          player_character_combat_stats(hp_max, armor_class)
        `)
        .eq("campaign_id", campaignId)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching player characters:", error);
        throw new Error("Failed to fetch player characters");
      }

      // Map to include combat stats
      return (data as PCWithCombatStats[]).map((pc) => ({
        id: pc.id,
        name: pc.name,
        max_hp: pc.player_character_combat_stats?.hp_max || null,
        armor_class: pc.player_character_combat_stats?.armor_class || null,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
