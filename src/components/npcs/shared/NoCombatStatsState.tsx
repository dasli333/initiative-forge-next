'use client';

import { Button } from '@/components/ui/button';
import { Swords } from 'lucide-react';

interface NoCombatStatsStateProps {
  onAddStats: () => void;
}

/**
 * Empty state component for CombatTab when NPC has no combat stats
 */
export function NoCombatStatsState({ onAddStats }: NoCombatStatsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Swords className="h-12 w-12 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold mb-2">No Combat Stats</h3>

      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        This NPC doesn&apos;t have combat statistics yet. Add combat stats to use this NPC in encounters.
      </p>

      <Button onClick={onAddStats} variant="default" size="sm" data-testid="add-combat-stats-button">
        Add Combat Stats
      </Button>
    </div>
  );
}
