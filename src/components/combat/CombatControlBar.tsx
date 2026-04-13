// Combat control bar with all combat controls and language toggle

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dices, Play, ArrowRight, Save, ArrowLeft } from "lucide-react";
import { RoundCounter } from "./initiative/RoundCounter";
import { PlayerInitiativeDialog } from "./initiative/PlayerInitiativeDialog";
import { useLanguageStore } from "@/stores/languageStore";
import { useRouter } from "next/navigation";
import { useCallback, useState, useMemo } from "react";
import type { CombatParticipantDTO } from "@/types";
import { rollDice, calculateModifier } from "@/lib/dice";

interface CombatControlBarProps {
  // Combat state
  currentRound: number;
  isCombatStarted: boolean;
  hasParticipants: boolean;
  allInitiativesSet: boolean;
  isDirty: boolean;
  isSaving: boolean;
  participants: CombatParticipantDTO[];

  // Handlers
  onRollInitiative: () => void;
  onSetManualInitiative: (entries: { id: string; initiative: number }[]) => void;
  onStartCombat: () => void;
  onNextTurn: () => void;
  onSave: () => void;

  // Navigation
  campaignId: string;
}

export function CombatControlBar({
  currentRound,
  isCombatStarted,
  hasParticipants,
  allInitiativesSet,
  isDirty,
  isSaving,
  participants,
  onRollInitiative,
  onSetManualInitiative,
  onStartCombat,
  onNextTurn,
  onSave,
  campaignId,
}: CombatControlBarProps) {
  // Language store
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);

  // Next.js router
  const router = useRouter();

  // Player initiative dialog
  const [showPlayerDialog, setShowPlayerDialog] = useState(false);
  const playerCharacters = useMemo(
    () => participants.filter((p) => p.source === "player_character"),
    [participants]
  );

  const handleRollInitiative = useCallback(() => {
    onRollInitiative(); // Auto-rolls non-PCs (or all if no PCs)
    if (playerCharacters.length > 0) {
      setShowPlayerDialog(true);
    }
  }, [onRollInitiative, playerCharacters.length]);

  const handlePlayerInitiativeConfirm = useCallback(
    (entries: { id: string; initiative: number }[]) => {
      onSetManualInitiative(entries);
      setShowPlayerDialog(false);
    },
    [onSetManualInitiative]
  );

  const handlePlayerInitiativeCancel = useCallback(() => {
    // Auto-roll PCs as fallback so combat isn't stuck
    const autoRolled = playerCharacters.map((p) => ({
      id: p.id,
      initiative: rollDice(1, 20)[0] + calculateModifier(p.stats.dex),
    }));
    onSetManualInitiative(autoRolled);
    setShowPlayerDialog(false);
  }, [playerCharacters, onSetManualInitiative]);

  // Back button handler
  const handleBack = useCallback(() => {
    router.push(`/campaigns/${campaignId}/combats`);
  }, [campaignId, router]);

  return (
    <div className="p-4 border-b border-border space-y-4">
      {!isCombatStarted ? (
        // Before combat starts - single row
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left side - Combat controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleRollInitiative} variant="outline" size="sm" data-testid="roll-initiative-button">
              <Dices className="mr-2 h-4 w-4" />
              Roll Initiative
            </Button>
            <Button onClick={onStartCombat} disabled={!hasParticipants || !allInitiativesSet} size="sm" data-testid="start-combat-button">
              <Play className="mr-2 h-4 w-4" />
              Start Combat
            </Button>
          </div>

          {/* Right side - Language toggle */}
          <div className="flex items-center gap-2">
            <Label htmlFor="combat-language-switch" className="text-sm font-medium cursor-pointer">
              {selectedLanguage === "en" ? "EN" : "PL"}
            </Label>
            <Switch
              id="combat-language-switch"
              checked={selectedLanguage === "pl"}
              onCheckedChange={toggleLanguage}
              aria-label="Toggle language between English and Polish"
            />
          </div>
        </div>
      ) : (
        // After combat starts - two rows
        <>
          {/* Row 1: Back, Save, Language Toggle */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Button onClick={handleBack} variant="ghost" size="sm" data-testid="back-button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={onSave} disabled={!isDirty || isSaving} variant="outline" size="sm" data-testid="save-combat-button">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>

            {/* Language toggle */}
            <div className="flex items-center gap-2">
              <Label htmlFor="combat-language-switch" className="text-sm font-medium cursor-pointer">
                {selectedLanguage === "en" ? "EN" : "PL"}
              </Label>
              <Switch
                id="combat-language-switch"
                checked={selectedLanguage === "pl"}
                onCheckedChange={toggleLanguage}
                aria-label="Toggle language between English and Polish"
              />
            </div>
          </div>

          {/* Row 2: Round Counter, Next Turn */}
          <div className="flex items-center gap-2 justify-between">
            <RoundCounter round={currentRound} />
            <Button onClick={onNextTurn} size="sm" className="bg-emerald-600 hover:bg-emerald-700" data-testid="next-turn-button">
              <ArrowRight className="mr-2 h-4 w-4" />
              Next Turn
              <span className="ml-2 text-xs text-emerald-200">(Space)</span>
            </Button>
          </div>
        </>
      )}
      {/* Player Initiative Dialog */}
      <PlayerInitiativeDialog
        open={showPlayerDialog}
        participants={playerCharacters}
        onConfirm={handlePlayerInitiativeConfirm}
        onCancel={handlePlayerInitiativeCancel}
      />
    </div>
  );
}
