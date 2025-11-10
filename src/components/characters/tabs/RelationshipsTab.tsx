'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Users, Trash2 } from 'lucide-react';
import type { PCNPCRelationshipViewModel, UpdatePCNPCRelationshipCommand } from '@/types/player-characters';

interface RelationshipsTabProps {
  relationships: PCNPCRelationshipViewModel[];
  isEditing: boolean;
  onUpdateRelationship: (relationshipId: string, command: UpdatePCNPCRelationshipCommand) => void;
  onDeleteRelationship: (relationshipId: string) => void;
  onAddRelationship: () => void;
  isUpdating: boolean;
}

/**
 * Relationships tab component for Player Character details
 * - List of PC→NPC relationships
 * - Each relationship shows: NPC avatar + name, relationship type, description
 * - Inline editing when panel is in edit mode
 * - Delete button
 * - "Add Relationship" button
 */
export function RelationshipsTab({
  relationships,
  isEditing,
  onUpdateRelationship,
  onDeleteRelationship,
  onAddRelationship,
  isUpdating,
}: RelationshipsTabProps) {
  if (!relationships || relationships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold mb-2">No Relationships Yet</h3>

        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Define relationships with NPCs to track allies, enemies, mentors, and connections in your campaign.
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
        {relationships.map((relationship) => (
          <RelationshipItem
            key={relationship.id}
            relationship={relationship}
            isEditing={isEditing}
            onUpdate={onUpdateRelationship}
            onDelete={onDeleteRelationship}
            isUpdating={isUpdating}
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

interface RelationshipItemProps {
  relationship: PCNPCRelationshipViewModel;
  isEditing: boolean;
  onUpdate: (relationshipId: string, command: UpdatePCNPCRelationshipCommand) => void;
  onDelete: (relationshipId: string) => void;
  isUpdating: boolean;
}

/**
 * Single relationship display/edit component
 */
function RelationshipItem({
  relationship,
  isEditing,
  onUpdate,
  onDelete,
  isUpdating,
}: RelationshipItemProps) {
  const [relationshipType, setRelationshipType] = useState(relationship.relationship_type);
  const [description, setDescription] = useState(relationship.description || '');

  const handleTypeBlur = () => {
    if (relationshipType !== relationship.relationship_type) {
      onUpdate(relationship.id, { relationship_type: relationshipType });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== (relationship.description || '')) {
      onUpdate(relationship.id, { description: description || null });
    }
  };

  const handleDelete = () => {
    onDelete(relationship.id);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
      {/* Avatar */}
      <Avatar className="h-12 w-12">
        <AvatarImage src={relationship.npc_image_url || undefined} alt={relationship.npc_name} />
        <AvatarFallback>{getInitials(relationship.npc_name)}</AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 space-y-3">
        {/* NPC Name (read-only) */}
        <div className="font-medium">{relationship.npc_name}</div>

        {/* Relationship Type */}
        {isEditing ? (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Relationship Type
            </label>
            <Input
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
              onBlur={handleTypeBlur}
              placeholder="e.g., Mentor, Ally, Rival, Friend"
              disabled={isUpdating}
              className="h-8"
            />
          </div>
        ) : (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Relationship Type
            </label>
            <p className="text-sm">{relationship.relationship_type}</p>
          </div>
        )}

        {/* Description */}
        {isEditing ? (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Description (optional)
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Describe their relationship..."
              disabled={isUpdating}
              className="h-8"
            />
          </div>
        ) : (
          relationship.description && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Description
              </label>
              <p className="text-sm text-foreground/90">{relationship.description}</p>
            </div>
          )
        )}
      </div>

      {/* Delete Button */}
      {isEditing && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isUpdating}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Relationship</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the relationship with {relationship.npc_name}? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
