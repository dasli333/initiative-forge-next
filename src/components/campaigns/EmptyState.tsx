'use client';

import { FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  /** Callback to open create campaign modal */
  onCreate: () => void;
}

/**
 * Empty state component displayed when user has no campaigns
 * Includes a call-to-action button to create the first campaign
 */
export function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FolderOpen className="w-24 h-24 text-muted-foreground mb-6" />
        <h2 className="text-3xl font-bold mb-3">You don&apos;t have any campaigns yet</h2>
        <p className="text-muted-foreground mb-8 text-lg">Create your first campaign to get started</p>
        <Button data-testid="create-campaign-button" onClick={onCreate} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-5 h-5 mr-2" />
          Create Campaign
        </Button>
      </div>
    </div>
  );
}
