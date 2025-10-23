import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { validateStep5 } from "./utils";
import type { Step5Props } from "./types";

export function Step5_Summary({
  combatName,
  selectedPlayerCharacters,
  addedMonsters,
  addedNPCs,
  onBack,
  onSubmit,
  isSubmitting,
}: Step5Props) {
  const validation = validateStep5(
    selectedPlayerCharacters.map((pc) => pc.id),
    addedMonsters,
    addedNPCs
  );

  const totalParticipants =
    selectedPlayerCharacters.length +
    Array.from(addedMonsters.values()).reduce((sum, m) => sum + m.count, 0) +
    addedNPCs.length;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 id="step-5-heading" className="text-2xl font-bold mb-6" tabIndex={-1}>
        Combat Summary
      </h2>

      <p className="text-muted-foreground mb-6">
        Review your combat setup before starting. You can go back to make changes if needed.
      </p>

      <div className="space-y-6">
        {/* Combat Name */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Combat Name</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{combatName}</p>
          </CardContent>
        </Card>

        {/* Player Characters */}
        {selectedPlayerCharacters.length > 0 && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Player Characters
                <Badge variant="secondary">{selectedPlayerCharacters.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedPlayerCharacters.map((character) => (
                  <div
                    key={character.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                  >
                    <span className="font-medium">{character.name}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">HP: {character.max_hp}</Badge>
                      <Badge variant="outline">AC: {character.armor_class}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monsters */}
        {addedMonsters.size > 0 && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Monsters
                <Badge variant="secondary">
                  {Array.from(addedMonsters.values()).reduce((sum, m) => sum + m.count, 0)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from(addedMonsters.values()).map((monster) => (
                  <div
                    key={monster.monster_id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                  >
                    <span className="font-medium">{monster.name}</span>
                    <Badge variant="outline">x{monster.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* NPCs */}
        {addedNPCs.length > 0 && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                NPCs
                <Badge variant="secondary">{addedNPCs.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {addedNPCs.map((npc) => (
                  <div
                    key={npc.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                  >
                    <span className="font-medium">{npc.display_name}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">HP: {npc.max_hp}</Badge>
                      <Badge variant="outline">AC: {npc.armor_class}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Total Summary */}
        <Card data-testid="combat-summary-participants" className="border-emerald-500 bg-gradient-to-r from-card via-card/80 to-emerald-500/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalParticipants}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Ready to start</p>
                <p className="text-lg font-semibold">{combatName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Error */}
        {!validation.valid && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg" role="alert">
            <p className="text-destructive font-medium">{validation.error}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <Separator className="my-6" />

      <div className="flex justify-between items-center">
        <Button data-testid="wizard-back-button" onClick={onBack} variant="outline" size="lg" disabled={isSubmitting}>
          Back
        </Button>

        <Button
          data-testid="create-combat-button"
          onClick={onSubmit}
          disabled={!validation.valid || isSubmitting}
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-40"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            "Start Combat"
          )}
        </Button>
      </div>
    </div>
  );
}
