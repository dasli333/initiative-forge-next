'use client';

import { CombatCard } from './CombatCard';
import type { CombatSummaryDTO } from '@/types';

export interface CombatsGridProps {
  combats: CombatSummaryDTO[];
  onResume: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (combat: CombatSummaryDTO) => void;
}

export function CombatsGrid({ combats, onResume, onView, onDelete }: CombatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {combats.map((combat) => (
        <CombatCard key={combat.id} combat={combat} onResume={onResume} onView={onView} onDelete={onDelete} />
      ))}
    </div>
  );
}
