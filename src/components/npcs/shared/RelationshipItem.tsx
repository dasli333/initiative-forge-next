'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Trash2 } from 'lucide-react';
import type { NPCRelationshipViewModel } from '@/types/npcs';
import type { UpdateNPCRelationshipCommand } from '@/types/npc-relationships';

interface RelationshipItemProps {
  viewModel: NPCRelationshipViewModel;
  onUpdate: (relationshipId: string, command: UpdateNPCRelationshipCommand) => void;
  onDelete: (relationshipId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

/**
 * Single relationship display/edit component
 * - Avatar, name, type input, description textarea
 * - Delete button with confirmation
 * - Auto-save on blur
 */
export function RelationshipItem({
  viewModel,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: RelationshipItemProps) {
  const { relationship, otherNpcName, otherNpcImageUrl } = viewModel;

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
        <AvatarImage src={otherNpcImageUrl} alt={otherNpcName} />
        <AvatarFallback>{getInitials(otherNpcName)}</AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 space-y-3">
        {/* Name (read-only) */}
        <div className="font-medium">{otherNpcName}</div>

        {/* Relationship Type Input */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Relationship Type
          </label>
          <Input
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value)}
            onBlur={handleTypeBlur}
            placeholder="e.g., Friend, Enemy, Rival"
            disabled={isUpdating}
            className="h-8"
          />
        </div>

        {/* Description Input */}
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
      </div>

      {/* Delete Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Relationship</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the relationship with {otherNpcName}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
