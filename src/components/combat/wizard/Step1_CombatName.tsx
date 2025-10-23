import { useState, useCallback, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { validateStep1, generateDefaultCombatName } from "./utils";
import type { Step1Props } from "./types";

export function Step1_CombatName({ combatName, onNameChange, onNext }: Step1Props) {
  const [touched, setTouched] = useState(false);
  const validation = validateStep1(combatName);
  const hasInitialized = useRef(false);

  // Auto-fill with default name on mount if empty
  useEffect(() => {
    if (!hasInitialized.current && combatName.trim().length === 0) {
      hasInitialized.current = true;
      onNameChange(generateDefaultCombatName());
    }
  }, [combatName, onNameChange]); // Include all dependencies

  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && validation.valid) {
        e.preventDefault();
        onNext();
      }
    },
    [onNext, validation.valid]
  );

  const handleGenerateNewName = useCallback(() => {
    onNameChange(generateDefaultCombatName());
  }, [onNameChange]);

  const showError = touched && !validation.valid;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 id="step-1-heading" className="text-2xl font-bold mb-6" tabIndex={-1}>
        Name Your Combat
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="combat-name">Combat Name</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGenerateNewName}
              className="h-auto py-1 px-2 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Generate New
            </Button>
          </div>
          <Input
            id="combat-name"
            data-testid="combat-name-input"
            type="text"
            value={combatName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Goblin Ambush"
            maxLength={255}
            aria-invalid={showError}
            aria-describedby={showError ? "combat-name-error" : undefined}
            className={showError ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {showError && (
            <p id="combat-name-error" className="text-sm text-destructive" role="alert">
              {validation.error}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{combatName.length}/255 characters</p>
        </div>

        <div className="flex justify-end pt-4">
          <Button data-testid="wizard-next-button" onClick={onNext} disabled={!validation.valid} size="lg" className="min-w-32">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
