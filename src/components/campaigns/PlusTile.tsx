'use client';

import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface PlusTileProps {
  /** Callback to open create campaign modal */
  onCreate: () => void;
}

/**
 * Plus tile component for creating a new campaign
 * Displays as a dashed card with hover effect
 */
export function PlusTile({ onCreate }: PlusTileProps) {
  return (
    <Card
      data-testid="create-campaign-button"
      className="border-2 border-dashed border-muted-foreground/25 hover:border-emerald-500 hover:shadow-emerald-500/20 hover:shadow-lg transition-all cursor-pointer bg-muted/20"
      onClick={onCreate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCreate();
        }
      }}
      aria-label="Create new campaign"
    >
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="rounded-full bg-muted p-4">
          <Plus className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">Create New Campaign</p>
      </div>
    </Card>
  );
}
