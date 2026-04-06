'use client';

import { FolderOpen, Plus } from 'lucide-react';
import { EmptyState as SharedEmptyState } from '@/components/shared/EmptyState';

interface EmptyStateProps {
  /** Callback to open create campaign modal */
  onCreate: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <SharedEmptyState
        icon={FolderOpen}
        title="You don't have any campaigns yet"
        description="Create your first campaign to get started"
        action={{
          label: 'Create Campaign',
          onClick: onCreate,
          icon: Plus,
          'data-testid': 'create-campaign-button',
        }}
        size="lg"
      />
    </div>
  );
}
