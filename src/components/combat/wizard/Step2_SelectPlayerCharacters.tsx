import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { validateStep2 } from "./utils";
import type { Step2Props } from "./types";

export function Step2_SelectPlayerCharacters({
  campaignId,
  playerCharacters,
  selectedIds,
  onToggle,
  onBack,
  onNext,
  onSkip,
  isLoading,
  error,
}: Step2Props) {
  const validation = validateStep2(selectedIds);

  const handleToggle = useCallback(
    (characterId: string) => {
      onToggle(characterId);
    },
    [onToggle]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 id="step-2-heading" className="text-2xl font-bold mb-6" tabIndex={-1}>
          Select Player Characters
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
        <h2 id="step-2-heading" className="text-2xl font-bold mb-6" tabIndex={-1}>
          Select Player Characters
        </h2>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load player characters. Please try again.</AlertDescription>
        </Alert>
        <div className="flex justify-between pt-6">
          <Button onClick={onBack} variant="outline" size="lg">
            Back
          </Button>
        </div>
      </div>
    );
  }

  // No characters warning
  if (playerCharacters.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 id="step-2-heading" className="text-2xl font-bold mb-6" tabIndex={-1}>
          Select Player Characters
        </h2>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Player Characters</AlertTitle>
          <AlertDescription>
            No player characters in this campaign. You can still create a combat with only monsters and NPCs, or{" "}
            <a
              href={`/campaigns/${campaignId}/characters`}
              className="underline font-medium hover:underline"
            >
              create a character first
            </a>
          </AlertDescription>
        </Alert>
        <div className="flex justify-between pt-6">
          <Button onClick={onBack} variant="outline" size="lg">
            Back
          </Button>
          <Button onClick={onSkip || onNext} size="lg">
            Skip to Monsters
          </Button>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="max-w-4xl mx-auto">
      <h2 id="step-2-heading" className="text-2xl font-bold mb-6" tabIndex={-1}>
        Select Player Characters
      </h2>

      <p className="text-muted-foreground mb-6">Choose which player characters will participate in this combat.</p>

      <div className="space-y-3 mb-6">
        {playerCharacters.map((character) => {
          const isSelected = selectedIds.includes(character.id);

          return (
            <div
              key={character.id}
              className={`
                group relative flex items-center gap-4 p-4 rounded-lg border
                transition-all duration-200 ease-out
                ${
                  isSelected
                    ? "bg-gradient-to-r from-card via-card/80 to-emerald-500/5 border-emerald-500 shadow-sm"
                    : "bg-card border-border hover:border-emerald-500/30 hover:shadow-sm"
                }
              `}
            >
              <Checkbox
                id={`character-${character.id}`}
                data-testid={`character-checkbox-${character.name}`}
                checked={isSelected}
                onCheckedChange={() => handleToggle(character.id)}
              />
              <Label htmlFor={`character-${character.id}`} className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-base">{character.name}</span>
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
                      HP: {character.max_hp}
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
                      AC: {character.armor_class}
                    </Badge>
                  </div>
                </div>
              </Label>
            </div>
          );
        })}
      </div>

      {!validation.valid && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-4 font-medium" role="alert">
          {validation.error}
        </p>
      )}

      <div className="flex justify-between pt-4">
        <Button data-testid="wizard-back-button" onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <Button data-testid="wizard-next-button" onClick={onNext} disabled={!validation.valid} size="lg">
          Next
        </Button>
      </div>
    </div>
  );
}
