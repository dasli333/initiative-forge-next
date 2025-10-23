// Single roll result card

import { Card, CardContent } from "@/components/ui/card";
import { Sword, Heart, Shield } from "lucide-react";
import type { RollResult } from "@/types/combat-view.types";
import { formatDistanceToNow } from "date-fns";
import { DamageBadge } from "@/components/library";

interface RollCardProps {
  roll: RollResult;
}

export function RollCard({ roll }: RollCardProps) {
  // Icon based on roll type
  const Icon = roll.type === "attack" ? Sword : roll.type === "damage" ? Heart : Shield;

  // Color based on crit/fail
  const resultColor = roll.isCrit ? "text-emerald-600" : roll.isFail ? "text-red-600" : "text-foreground";

  const cardBorder = roll.isCrit ? "border-emerald-500" : roll.isFail ? "border-red-500" : "";

  // Format roll breakdown: "3, 5" or "18"
  const formatRollBreakdown = () => {
    return roll.rolls.join(", ");
  };

  return (
    <Card className={`${cardBorder} overflow-hidden flex-shrink-0 w-auto min-w-[250px] py-1`}>
      <CardContent className="p-2 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-semibold capitalize whitespace-nowrap">{roll.type}</span>
            {roll.type === "damage" && roll.damageType && (
              <DamageBadge type={roll.damageType} className="ml-0.5 text-xs px-1.5 py-0" />
            )}
          </div>
          <span className={`text-xl font-bold ${resultColor} shrink-0`}>{roll.result}</span>
        </div>
        <div className="text-[14px] text-muted-foreground space-y-0.5">
          <p className="italic whitespace-nowrap">{roll.formula}</p>
          <p className="font-mono whitespace-nowrap">Roll: {formatRollBreakdown()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
