'use client';

import { Swords, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  onCreateNew: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
      <Swords className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-2xl font-semibold">No combats yet</h2>
      <p className="text-muted-foreground">Start your first combat to track initiative and manage encounters</p>
      <Button onClick={onCreateNew} className="bg-emerald-600 hover:bg-emerald-700">
        <Plus className="mr-2 h-4 w-4" />
        Start New Combat
      </Button>
    </div>
  );
}
