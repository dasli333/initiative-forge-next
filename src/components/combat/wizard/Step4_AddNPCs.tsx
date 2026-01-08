import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import type { Step4Props } from "./types";

export function Step4_AddNPCs({
  campaignId,
  npcs,
  selectedIds,
  onToggle,
  onBack,
  onNext,
  onSkip,
  isLoading,
  error,
}: Step4Props) {
  const handleToggle = useCallback(
    (npcId: string) => {
      // Only toggle NPCs with combat stats
      const npc = npcs.find((n) => n.id === npcId);
      if (npc && npc.hp_max && npc.armor_class) {
        onToggle(npcId);
      }
    },
    [onToggle, npcs]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 id="step-4-heading" className="text-2xl font-bold mb-6" tabIndex={-1}>
          Select NPCs (Optional)
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card">
              <Skeleton className="w-5 h-5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 id="step-4-heading" className="text-2xl font-bold mb-6" tabIndex={-1}>
          Select NPCs (Optional)
        </h2>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load NPCs. Please try again.</AlertDescription>
        </Alert>
        <div className="flex justify-between pt-6">
          <Button data-testid="wizard-back-button" onClick={onBack} variant="outline" size="lg">
            Back
          </Button>
        </div>
      </div>
    );
  }

  // No NPCs in campaign
  if (npcs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 id="step-4-heading" className="text-2xl font-bold mb-6" tabIndex={-1}>
          Select NPCs (Optional)
        </h2>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No NPCs</AlertTitle>
          <AlertDescription>
            No NPCs in this campaign. You can skip this step or{" "}
            <a href={`/campaigns/${campaignId}/npcs`} className="underline font-medium hover:underline">
              create an NPC first
            </a>
          </AlertDescription>
        </Alert>
        <div className="flex justify-between pt-6">
          <Button data-testid="wizard-back-button" onClick={onBack} variant="outline" size="lg">
            Back
          </Button>
          <Button data-testid="wizard-next-button" onClick={onSkip || onNext} size="lg">
            Skip
          </Button>
        </div>
      </div>
    );
  }

  // Main content
  const npcsWithoutStats = npcs.filter((n) => !n.hp_max || !n.armor_class);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 id="step-4-heading" className="text-2xl font-bold mb-6" tabIndex={-1}>
        Select NPCs (Optional)
      </h2>

      <p className="text-muted-foreground mb-6">
        Choose which NPCs will participate in this combat. You can skip this step if not needed.
      </p>

      {npcsWithoutStats.length > 0 && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Combat Stats</AlertTitle>
          <AlertDescription>
            {npcsWithoutStats.length} NPC{npcsWithoutStats.length > 1 ? "s are" : " is"} missing combat stats and cannot
            be added to combat. Add HP and AC to these NPCs to enable them.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3 mb-6">
        {npcs.map((npc) => {
          const isSelected = selectedIds.includes(npc.id);
          const hasCombatStats = !!(npc.hp_max && npc.armor_class);

          return (
            <div
              key={npc.id}
              className={`
                group relative flex items-center gap-4 p-4 rounded-lg border
                transition-all duration-200 ease-out
                ${
                  !hasCombatStats
                    ? "bg-muted/30 border-border opacity-60 cursor-not-allowed"
                    : isSelected
                      ? "bg-gradient-to-r from-card via-card/80 to-emerald-500/5 border-emerald-500 shadow-sm"
                      : "bg-card border-border hover:border-emerald-500/30 hover:shadow-sm"
                }
              `}
              title={!hasCombatStats ? "This NPC is missing combat stats" : ""}
            >
              <Checkbox
                id={`npc-${npc.id}`}
                data-testid={`npc-checkbox-${npc.name}`}
                checked={isSelected}
                onCheckedChange={() => handleToggle(npc.id)}
                disabled={!hasCombatStats}
              />
              <Label
                htmlFor={hasCombatStats ? `npc-${npc.id}` : undefined}
                className={hasCombatStats ? "flex-1 cursor-pointer" : "flex-1 cursor-not-allowed"}
                onClick={!hasCombatStats ? (e) => e.preventDefault() : undefined}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-base">{npc.name}</span>
                  {hasCombatStats ? (
                    <div className="flex gap-2">
                      <Badge
                        className={`
                          px-3 py-1 text-sm shadow-sm
                          ${
                            isSelected
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : "bg-secondary text-secondary-foreground"
                          }
                        `}
                      >
                        HP: {npc.hp_max}
                      </Badge>
                      <Badge
                        className={`
                          px-3 py-1 text-sm shadow-sm
                          ${
                            isSelected
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : "bg-secondary text-secondary-foreground"
                          }
                        `}
                      >
                        AC: {npc.armor_class}
                      </Badge>
                    </div>
                  ) : (
                    <Badge variant="outline" className="px-3 py-1 text-sm text-amber-600 border-amber-400">
                      Missing combat stats
                    </Badge>
                  )}
                </div>
              </Label>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button data-testid="wizard-back-button" onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <Button data-testid="wizard-next-button" onClick={onNext} size="lg">
          Next
        </Button>
      </div>
    </div>
  );
}
