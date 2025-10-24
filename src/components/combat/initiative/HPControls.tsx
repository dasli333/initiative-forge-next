// HP control component with visual progress bar, damage and heal buttons

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface HPControlsProps {
  currentHP: number;
  maxHP: number;
  onHPChange: (amount: number, type: "damage" | "heal") => void;
}

export function HPControls({ currentHP, maxHP, onHPChange }: HPControlsProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);

    // Walidacja
    const num = parseInt(val, 10);
    if (val && (isNaN(num) || num <= 0)) {
      setError("Must be a positive number");
    } else {
      setError("");
    }
  }, []);

  const handleDamage = useCallback(() => {
    const amount = parseInt(value, 10);
    if (!isNaN(amount) && amount > 0) {
      onHPChange(amount, "damage");
      setValue("");
      setError("");
    }
  }, [value, onHPChange]);

  const handleHeal = useCallback(() => {
    const amount = parseInt(value, 10);
    if (!isNaN(amount) && amount > 0) {
      onHPChange(amount, "heal");
      setValue("");
      setError("");
    }
  }, [value, onHPChange]);

  const isValid = !error && value !== "";

  // Calculate HP percentage and color
  const hpPercentage = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;
  const hpColor = hpPercentage > 50 ? "bg-emerald-600" : hpPercentage > 25 ? "bg-yellow-600" : "bg-red-600";

  return (
    <div className="space-y-1">
      {/* Horizontal layout: Progress bar on left, controls on right */}
      <div className="flex items-center gap-2">
        {/* Left: HP Progress Bar */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">HP</span>
            <span className="font-semibold text-xs" data-testid="hp-display">
              {currentHP}/{maxHP}
            </span>
          </div>
          <Progress value={hpPercentage} className="h-1.5" data-testid="hp-progress-bar" />
        </div>

        {/* Right: Input + Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Input
            type="number"
            placeholder="#"
            value={value}
            onChange={handleChange}
            className={`w-14 h-7 text-xs px-2 ${error ? "border-red-500" : ""}`}
            min={1}
            data-testid="hp-amount-input"
          />
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDamage}
            disabled={!isValid}
            className="h-7 px-2 text-xs"
            data-testid="hp-damage-button"
          >
            DMG
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 h-7 px-2 text-xs"
            onClick={handleHeal}
            disabled={!isValid}
            data-testid="hp-heal-button"
          >
            HEAL
          </Button>
        </div>
      </div>
      {error && <span className="text-xs text-red-500 block">{error}</span>}
    </div>
  );
}
