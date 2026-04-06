// Death saving throw tracker (D&D 5e rules)

import { Dices, Plus, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeathSaveTrackerProps {
  successes: number;
  failures: number;
  lastRoll?: number;
  onRoll: () => void;
  onManualResult: (type: "success" | "failure") => void;
  onKill: () => void;
}

function Dots({ count, max, colorClass }: { count: number; max: number; colorClass: string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`h-2.5 w-2.5 rounded-full border ${
            i < count ? colorClass : "border-muted-foreground/30 bg-transparent"
          }`}
        />
      ))}
    </div>
  );
}

function RollBadge({ roll }: { roll: number }) {
  const isNat20 = roll === 20;
  const isNat1 = roll === 1;
  const isSuccess = roll >= 10;
  const colorClass = isNat20
    ? "bg-emerald-500 text-white"
    : isNat1
      ? "bg-red-600 text-white"
      : isSuccess
        ? "text-emerald-600 bg-emerald-500/10"
        : "text-red-600 bg-red-500/10";

  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold ${colorClass}`} data-testid="death-save-roll-result">
      d20: {roll}
      {isNat20 && " ★"}
      {isNat1 && " ✗✗"}
    </span>
  );
}

export function DeathSaveTracker({ successes, failures, lastRoll, onRoll, onManualResult, onKill }: DeathSaveTrackerProps) {
  return (
    <div className="space-y-1.5" data-testid="death-save-tracker">
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">S</span>
          <Dots count={successes} max={3} colorClass="bg-emerald-500 border-emerald-500" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">F</span>
          <Dots count={failures} max={3} colorClass="bg-red-500 border-red-500" />
        </div>
        {lastRoll !== undefined && <RollBadge roll={lastRoll} />}
      </div>
      <div className="flex items-center gap-1 text-xs">
        <Button
          size="sm"
          variant="outline"
          className="h-6 px-2 text-xs"
          onClick={onRoll}
          data-testid="roll-death-save-button"
        >
          <Dices className="h-3 w-3 mr-1" />
          Roll
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 px-1.5 text-xs text-emerald-600"
          onClick={() => onManualResult("success")}
          data-testid="manual-death-save-success"
          title="Add success"
        >
          <Plus className="h-3 w-3" />S
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 px-1.5 text-xs text-red-600"
          onClick={() => onManualResult("failure")}
          data-testid="manual-death-save-failure"
          title="Add failure"
        >
          <Plus className="h-3 w-3" />F
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="h-6 px-2 text-xs ml-auto"
          onClick={onKill}
          data-testid="kill-button"
          title="Instant kill"
        >
          <Skull className="h-3 w-3 mr-1" />
          Kill
        </Button>
      </div>
    </div>
  );
}
