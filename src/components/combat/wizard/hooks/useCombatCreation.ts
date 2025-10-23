import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { CreateCombatCommand, CombatDTO } from "@/types";

/**
 * Hook do tworzenia walki
 * Używa TanStack Query (useMutation)
 */
export function useCombatCreation(campaignId: string) {
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreateCombatCommand) => {
      const response = await fetch(`/api/campaigns/${campaignId}/combats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create combat");
      }

      const data: CombatDTO = await response.json();
      return data;
    },
    onSuccess: (combat) => {
      // Redirect do combat tracker (używa uproszczonego URL bez campaign_id)
      router.push(`/combats/${combat.id}`);
    },
    onError: (error) => {
      // Wyświetl error toast (np. Shadcn Toast)
      console.error("Error creating combat:", error);
    },
  });
}
