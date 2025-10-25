import { dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { CombatViewWrapper } from "@/components/combat/CombatViewWrapper";
import { getSupabaseServerClient } from "@/lib/supabase.server";
import { notFound } from "next/navigation";
import type { CombatDTO, Condition } from "@/types";

export const dynamic = 'force-dynamic';

interface CombatPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    campaignId?: string;
  }>;
}

export default async function CombatPage({ params, searchParams }: CombatPageProps) {
  const { id } = await params;
  const { campaignId: campaignIdFromQuery } = await searchParams;

  const queryClient = getQueryClient();
  const supabase = await getSupabaseServerClient();

  // Prefetch combat data
  let combatData: CombatDTO | null = null;

  try {
    combatData = await queryClient.fetchQuery({
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

        return data as CombatDTO;
      },
      staleTime: 0, // Always fetch fresh data
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
    console.error("[Combat Page] Error prefetching combat:", {
      error,
      combatId: id,
      campaignIdFromQuery,
    });
    notFound();
  }

  const dehydratedState = dehydrate(queryClient);

  // Extract campaignId from fetched combat data, with query param as fallback
  const campaignId = combatData?.campaign_id || campaignIdFromQuery;

  if (!campaignId || !combatData) {
    console.error("[Combat Page] Missing campaignId or combatData", {
      campaignId,
      campaignIdFromQuery,
      combatDataCampaignId: combatData?.campaign_id,
      hasCombatData: !!combatData,
    });
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
