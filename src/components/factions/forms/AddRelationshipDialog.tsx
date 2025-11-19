'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FactionDTO } from '@/types/factions';
import type { FactionRelationshipViewModel } from '@/types/factions';

interface AddRelationshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RelationshipFormData) => void;
  currentFactionId: string;
  allFactions: FactionDTO[];
  mode: 'create' | 'edit';
  relationship?: FactionRelationshipViewModel | null;
  isSubmitting?: boolean;
}

const relationshipSchema = z.object({
  faction_id_2: z.string().uuid('Please select a faction'),
  relationship_type: z.enum(['alliance', 'war', 'rivalry', 'neutral']),
  description: z.string().max(500, 'Description too long').nullable().optional(),
});

type RelationshipFormData = z.infer<typeof relationshipSchema>;

/**
 * Dialog for adding/editing faction relationships
 * - Select target faction (dropdown with search, exclude current faction)
 * - Select relationship type (alliance/war/rivalry/neutral)
 * - Optional description (max 500 chars)
 */
export function AddRelationshipDialog({
  isOpen,
  onClose,
  onSubmit,
  currentFactionId,
  allFactions,
  mode,
  relationship,
  isSubmitting = false,
}: AddRelationshipDialogProps) {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<RelationshipFormData>({
    resolver: zodResolver(relationshipSchema),
    defaultValues: {
      faction_id_2: relationship?.other_faction_id || '',
      relationship_type: relationship?.relationship_type || 'neutral',
      description: relationship?.description || '',
    },
  });

  const selectedFactionId = watch('faction_id_2');
  const selectedType = watch('relationship_type');
  const description = watch('description');

  // Filter out current faction
  const availableFactions = allFactions.filter(f => f.id !== currentFactionId);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: RelationshipFormData) => {
    // Validate not selecting self
    if (data.faction_id_2 === currentFactionId) {
      return;
    }
    onSubmit(data);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Relationship' : 'Edit Relationship'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a relationship with another faction.'
              : 'Update the relationship details.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Target Faction */}
          <div>
            <Label htmlFor="faction">
              Faction <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedFactionId}
              onValueChange={(value) => setValue('faction_id_2', value)}
              disabled={mode === 'edit' || isSubmitting}
            >
              <SelectTrigger id="faction">
                <SelectValue placeholder="Select a faction" />
              </SelectTrigger>
              <SelectContent>
                {availableFactions.map((faction) => (
                  <SelectItem key={faction.id} value={faction.id}>
                    {faction.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.faction_id_2 && (
              <p className="text-xs text-destructive mt-1">{errors.faction_id_2.message}</p>
            )}
          </div>

          {/* Relationship Type */}
          <div>
            <Label htmlFor="type">
              Relationship Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue('relationship_type', value as 'alliance' | 'war' | 'rivalry' | 'neutral')}
              disabled={isSubmitting}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alliance">🤝 Alliance</SelectItem>
                <SelectItem value="war">⚔️ War</SelectItem>
                <SelectItem value="rivalry">⚡ Rivalry</SelectItem>
                <SelectItem value="neutral">⚖️ Neutral</SelectItem>
              </SelectContent>
            </Select>
            {errors.relationship_type && (
              <p className="text-xs text-destructive mt-1">{errors.relationship_type.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description || ''}
              onChange={(e) => setValue('description', e.target.value || null)}
              placeholder="Describe the relationship..."
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(description?.length || 0)}/500 characters
            </p>
            {errors.description && (
              <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Relationship' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
