'use client';

import { useState } from 'react';
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
import type { CreatePCNPCRelationshipCommand } from '@/types/player-characters';

interface AddPCNPCRelationshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (command: CreatePCNPCRelationshipCommand) => void;
  availableNPCs: Array<{ id: string; name: string }>;
  isSubmitting: boolean;
}

/**
 * Dialog for adding a new PC→NPC relationship
 * - NPC selector (dropdown)
 * - Relationship type input (free text with suggestions)
 * - Description textarea (optional)
 */
export function AddPCNPCRelationshipDialog({
  isOpen,
  onClose,
  onSubmit,
  availableNPCs,
  isSubmitting = false,
}: AddPCNPCRelationshipDialogProps) {
  const [selectedNpcId, setSelectedNpcId] = useState<string>('');
  const [relationshipType, setRelationshipType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errors, setErrors] = useState<{ npc_id?: string; relationship_type?: string }>({});

  const handleClose = () => {
    setSelectedNpcId('');
    setRelationshipType('');
    setDescription('');
    setErrors({});
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { npc_id?: string; relationship_type?: string } = {};
    if (!selectedNpcId) {
      newErrors.npc_id = 'Please select an NPC';
    }
    if (!relationshipType.trim()) {
      newErrors.relationship_type = 'Relationship type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      npc_id: selectedNpcId,
      relationship_type: relationshipType.trim(),
      description: description.trim() || null,
    });
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Relationship</DialogTitle>
          <DialogDescription>
            Define a relationship between this character and an NPC in your campaign.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NPC Selector */}
          <div>
            <Label htmlFor="npc">
              NPC <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedNpcId}
              onValueChange={(value) => {
                setSelectedNpcId(value);
                setErrors((prev) => ({ ...prev, npc_id: undefined }));
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id="npc">
                <SelectValue placeholder="Select NPC..." />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {availableNPCs.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No NPCs available
                  </div>
                ) : (
                  availableNPCs.map((npc) => (
                    <SelectItem key={npc.id} value={npc.id}>
                      {npc.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.npc_id && (
              <p className="text-xs text-destructive mt-1">{errors.npc_id}</p>
            )}
          </div>

          {/* Relationship Type */}
          <div>
            <Label htmlFor="relationship_type">
              Relationship Type <span className="text-destructive">*</span>
            </Label>
            <Input
              id="relationship_type"
              value={relationshipType}
              onChange={(e) => {
                setRelationshipType(e.target.value);
                setErrors((prev) => ({ ...prev, relationship_type: undefined }));
              }}
              placeholder="e.g., Mentor, Ally, Rival, Friend"
              disabled={isSubmitting}
            />
            {errors.relationship_type && (
              <p className="text-xs text-destructive mt-1">{errors.relationship_type}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Suggestions: Mentor, Ally, Rival, Friend, Enemy, Family, Contact, Employer
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe their relationship..."
              disabled={isSubmitting}
            />
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedNpcId || !relationshipType.trim()}>
              {isSubmitting ? 'Adding...' : 'Add Relationship'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
