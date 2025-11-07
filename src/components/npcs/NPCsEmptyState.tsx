'use client';

import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface NPCsEmptyStateProps {
  onCreateClick: () => void;
}

/**
 * Empty state component when no NPCs exist
 * - Message: "No NPCs yet"
 * - CTA: "Create your first NPC" button
 */
export function NPCsEmptyState({ onCreateClick }: NPCsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-8 mb-6">
        <Users className="h-16 w-16 text-muted-foreground" />
      </div>

      <h2 className="text-2xl font-bold mb-3">No NPCs Yet</h2>

      <p className="text-muted-foreground mb-8 max-w-md">
        Create your first non-player character to populate your campaign world with memorable personalities.
      </p>

      <Button onClick={onCreateClick} size="lg" className="bg-emerald-600 hover:bg-emerald-700">
        Create Your First NPC
      </Button>
    </div>
  );
}
