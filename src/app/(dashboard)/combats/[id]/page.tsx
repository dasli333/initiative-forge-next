import { dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { CombatViewWrapper } from "@/components/combat/CombatViewWrapper";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { notFound } from "next/navigation";
import type { CombatDTO, Condition } from "@/types";

interface CombatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CombatPage({ params }: CombatPageProps) {
  const { id } = await params;

  const queryClient = getQueryClient();
  const supabase = await getSupabaseServerClient();

  // Prefetch combat data
  let combatData: CombatDTO | null = null;

  try {
    await queryClient.prefetchQuery({
      queryKey: ["combat", id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("combats")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            throw new Error("Combat not found");
          }
          throw error;
        }

        combatData = data as CombatDTO;
        return data as CombatDTO;
      },
    });

    // Prefetch conditions
    await queryClient.prefetchQuery({
      queryKey: ["conditions"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("conditions")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;

        return data as Condition[];
      },
    });
  } catch (error) {
    console.error("[Combat Page] Error prefetching combat:", error);
    notFound();
  }

  const dehydratedState = dehydrate(queryClient);

  // Get cached combat to extract campaignId
  const cachedCombat = queryClient.getQueryData(["combat", id]) as CombatDTO | undefined;
  const campaignId = cachedCombat?.campaign_id;

  if (!campaignId || !combatData) {
    console.error("[Combat Page] Missing campaignId or combatData");
    notFound();
  }

  return (
    <CombatViewWrapper
      dehydratedState={dehydratedState}
      combatId={id}
      campaignId={campaignId}
      initialData={combatData}
    />
  );
}
