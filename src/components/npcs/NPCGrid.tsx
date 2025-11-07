'use client';

import { NPCCard } from './NPCCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { NPCCardViewModel } from '@/types/npcs';

interface NPCGridProps {
  viewModels: NPCCardViewModel[];
  onCardClick: (npcId: string) => void;
  isLoading?: boolean;
}

/**
 * Responsive grid for displaying NPC cards
 * - 3 columns desktop, 2 tablet, 1 mobile
 * - Maps NPCs to NPCCard[]
 * - Skeleton loading state
 */
export function NPCGrid({ viewModels, onCardClick, isLoading = false }: NPCGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {viewModels.map((viewModel) => (
        <NPCCard
          key={viewModel.npc.id}
          viewModel={viewModel}
          onClick={() => onCardClick(viewModel.npc.id)}
        />
      ))}
    </div>
  );
}
