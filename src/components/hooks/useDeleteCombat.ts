import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ListCombatsResponseDTO } from "@/types";

export function useDeleteCombat(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (combatId: string): Promise<void> => {
      const response = await fetch(`/api/combats/${combatId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete combat");
      }
    },

    // Optimistic update
    onMutate: async (combatId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["combats", campaignId] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<ListCombatsResponseDTO>(["combats", campaignId]);

      // Optimistically update to remove combat
      if (previousData) {
        queryClient.setQueryData<ListCombatsResponseDTO>(["combats", campaignId], {
          ...previousData,
          combats: previousData.combats.filter((c) => c.id !== combatId),
          total: previousData.total - 1,
        });
      }

      return { previousData };
    },

    // Rollback on error
    onError: (error, combatId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["combats", campaignId], context.previousData);
      }
      toast.error("Failed to delete combat");
    },

    // Success notification
    onSuccess: () => {
      toast.success("Combat deleted successfully");
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["combats", campaignId] });
    },
  });
}
