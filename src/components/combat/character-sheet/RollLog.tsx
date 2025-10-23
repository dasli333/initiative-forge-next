// Log of recent rolls (max 3)

import type { RollResult } from "@/types/combat-view.types";
import { RollCard } from "./RollCard";

interface RollLogProps {
  rolls: RollResult[];
}

export function RollLog({ rolls }: RollLogProps) {
  if (rolls.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No rolls yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 max-w-full">
      {rolls.map((roll) => (
        <RollCard key={roll.id} roll={roll} />
      ))}
    </div>
  );
}
