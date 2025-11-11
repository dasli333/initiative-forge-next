'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { relationshipSchema } from '@/lib/schemas/npcs';
import type { CreateNPCRelationshipCommand } from '@/types/npc-relationships';

interface AddRelationshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNPCRelationshipCommand) => void;
  currentNpcId: string;
  availableNPCs: Array<{ id: string; name: string; image_url?: string | null }>;
  isSubmitting?: boolean;
}

interface FormData {
  npc_id_2: string;
  relationship_type: string;
  description?: string;
}

/**
 * Dialog for adding a new NPC relationship
 * - NPC selector (autocomplete dropdown)
 * - Relationship type input (free text)
 * - Description textarea (optional)
 * - Validation: npc_id_1 !== npc_id_2
 */
export function AddRelationshipDialog({
  isOpen,
  onClose,
  onSubmit,
  currentNpcId,
  availableNPCs,
  isSubmitting = false,
}: AddRelationshipDialogProps) {
  const [selectedNpcId, setSelectedNpcId] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(
      relationshipSchema.omit({ npc_id_1: true })
    ),
    defaultValues: {
      npc_id_2: '',
      relationship_type: '',
      description: '',
    },
  });

  const handleClose = () => {
    reset();
    setSelectedNpcId('');
    onClose();
  };

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      npc_id_1: currentNpcId,
      npc_id_2: data.npc_id_2,
      relationship_type: data.relationship_type,
      description: data.description || null,
    });
    handleClose();
  };

  // Filter out current NPC from available options
  const filteredNPCs = availableNPCs.filter((npc) => npc.id !== currentNpcId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Relationship</DialogTitle>
          <DialogDescription>
            Define a relationship between this NPC and another character in your campaign.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* NPC Selector */}
          <div>
            <Label htmlFor="npc">
              NPC <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedNpcId}
              onValueChange={(value) => {
                setSelectedNpcId(value);
                setValue('npc_id_2', value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select NPC..." />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {filteredNPCs.map((npc) => (
                  <SelectItem key={npc.id} value={npc.id}>
                    {npc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.npc_id_2 && (
              <p className="text-xs text-destructive mt-1">{errors.npc_id_2.message}</p>
            )}
          </div>

          {/* Relationship Type */}
          <div>
            <Label htmlFor="relationship_type">
              Relationship Type <span className="text-destructive">*</span>
            </Label>
            <Input
              id="relationship_type"
              {...register('relationship_type')}
              placeholder="e.g., Friend, Enemy, Rival, Mentor"
            />
            {errors.relationship_type && (
              <p className="text-xs text-destructive mt-1">{errors.relationship_type.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Describe their relationship..."
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedNpcId}>
              {isSubmitting ? 'Adding...' : 'Add Relationship'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
