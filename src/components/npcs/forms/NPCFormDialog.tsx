'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { npcFormSchema, type NPCFormData } from '@/lib/schemas/npcs';
import { TagBadge } from '../shared/TagBadge';
import type { NPCTagDTO } from '@/types/npc-tags';

interface NPCFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NPCFormData) => void;
  campaignId: string;
  factions: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  tags: NPCTagDTO[];
  mode: 'create' | 'edit';
  initialData?: Partial<NPCFormData>;
  isSubmitting?: boolean;
}

/**
 * Simplified single-step form dialog for creating/editing NPCs
 * - Basic Info only (name*, role, faction, location, status, image, tags)
 * - Biography/personality/combat edited in detail panel after creation
 */
export function NPCFormDialog({
  isOpen,
  onClose,
  onSubmit,
  campaignId,
  factions,
  locations,
  tags,
  mode,
  initialData,
  isSubmitting = false,
}: NPCFormDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<NPCFormData>({
    resolver: zodResolver(npcFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      role: initialData?.role || '',
      faction_id: initialData?.faction_id || null,
      current_location_id: initialData?.current_location_id || null,
      status: initialData?.status || 'alive',
      image_url: initialData?.image_url || null,
      tag_ids: initialData?.tag_ids || [],
    },
  });

  const selectedTagIds = watch('tag_ids') || [];
  const selectedFactionId = watch('faction_id');
  const selectedLocationId = watch('current_location_id');
  const selectedStatus = watch('status');
  const imageUrl = watch('image_url');

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: NPCFormData) => {
    onSubmit(data);
    handleClose();
  };

  const toggleTag = (tagId: string) => {
    const currentIds = selectedTagIds;
    const newIds = currentIds.includes(tagId)
      ? currentIds.filter((id) => id !== tagId)
      : [...currentIds, tagId];
    setValue('tag_ids', newIds);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New NPC' : 'Edit NPC'}
          </DialogTitle>
          <DialogDescription>
            Fill in basic information. You can add biography, personality, and combat stats later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" {...register('name')} placeholder="Enter NPC name" />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role">Role</Label>
            <Input id="role" {...register('role')} placeholder="e.g., Quest Giver, Merchant" />
            {errors.role && (
              <p className="text-xs text-destructive mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Grid: Faction, Location, Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="faction">Faction</Label>
              <Select
                value={selectedFactionId || 'none'}
                onValueChange={(value) => setValue('faction_id', value === 'none' ? null : value)}
              >
                <SelectTrigger id="faction">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {factions.map((faction) => (
                    <SelectItem key={faction.id} value={faction.id}>
                      {faction.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Select
                value={selectedLocationId || 'none'}
                onValueChange={(value) => setValue('current_location_id', value === 'none' ? null : value)}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setValue('status', value as 'alive' | 'dead' | 'unknown')}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alive">Alive</SelectItem>
                  <SelectItem value="dead">Dead</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label>Image</Label>
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setValue('image_url', url)}
              campaignId={campaignId}
              maxSizeMB={5}
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags (optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Select up to 10 tags to categorize this NPC
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tags available. Create tags in Tag Manager first.
                </p>
              ) : (
                tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`relative ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      <TagBadge tag={tag} size="sm" />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            {selectedTagIds.length > 10 && (
              <p className="text-xs text-destructive mt-1">Maximum 10 tags allowed</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create NPC' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
