'use client';

import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { RelationshipItem } from '../shared/RelationshipItem';
import type { NPCDetailsViewModel } from '@/types/npcs';
import type { UpdateNPCRelationshipCommand } from '@/types/npc-relationships';

interface RelationshipsTabProps {
  viewModel: NPCDetailsViewModel;
  onUpdateRelationship: (relationshipId: string, command: UpdateNPCRelationshipCommand) => void;
  onDeleteRelationship: (relationshipId: string) => void;
  onAddRelationship: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

/**
 * Relationships tab component for NPC details
 * - RelationshipsList: map RelationshipItem[]
 * - Empty state: "No relationships yet"
 * - "Add Relationship" button → open AddRelationshipDialog
 */
export function RelationshipsTab({
  viewModel,
  onUpdateRelationship,
  onDeleteRelationship,
  onAddRelationship,
  isUpdating = false,
  isDeleting = false,
}: RelationshipsTabProps) {
  const { relationships } = viewModel;

  if (!relationships || relationships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold mb-2">No Relationships Yet</h3>

        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Define relationships between NPCs to track allies, enemies, rivalries, and connections in your campaign.
        </p>

        <Button onClick={onAddRelationship} variant="default" size="sm">
          Add Relationship
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Relationships List */}
      <div className="space-y-3">
        {relationships.map((relationshipVM) => (
          <RelationshipItem
            key={relationshipVM.relationship.id}
            viewModel={relationshipVM}
            onUpdate={onUpdateRelationship}
            onDelete={onDeleteRelationship}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        ))}
      </div>

      {/* Add Button */}
      <Button onClick={onAddRelationship} variant="outline" className="w-full">
        <Users className="h-4 w-4 mr-2" />
        Add Relationship
      </Button>
    </div>
  );
}
