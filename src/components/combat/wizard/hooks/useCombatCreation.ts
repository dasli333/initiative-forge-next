import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { createCombat } from "@/lib/api/combats";
import { useAuthStore } from "@/stores/authStore";
import type { CreateCombatCommand } from "@/types";

/**
 * Hook for creating a combat encounter
 * Uses TanStack Query (useMutation) with direct Supabase calls
 */
export function useCombatCreation(campaignId: string) {
  const router = useRouter();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (command: CreateCombatCommand) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const supabase = getSupabaseClient();
      return await createCombat(supabase, user.id, campaignId, command);
    },
    onSuccess: (combat) => {
      toast.success("Combat created successfully!");
      // Redirect to combat tracker
      router.push(`/combats/${combat.id}`);
    },
    onError: (error: Error) => {
      console.error("Error creating combat:", error);
      toast.error(error.message || "Failed to create combat");
    },
  });
}
