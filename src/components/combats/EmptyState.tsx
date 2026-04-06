'use client';

import { Swords, Plus } from 'lucide-react';
import { EmptyState as SharedEmptyState } from '@/components/shared/EmptyState';

export interface EmptyStateProps {
  onCreateNew: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <SharedEmptyState
      icon={Swords}
      title="No combats yet"
      description="Start your first combat to track initiative and manage encounters"
      action={{
        label: 'Start New Combat',
        onClick: onCreateNew,
        icon: Plus,
        'data-testid': 'create-combat-button-empty',
      }}
      size="md"
    />
  );
}
