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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import type { JSONContent } from '@tiptap/core';
import type { FactionDTO } from '@/types/factions';

const factionSchema = z.object({
  name: z.string().min(1, 'Name required').max(100, 'Name too long'),
  description_json: z.any().nullable().optional(),
  goals_json: z.any().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
});

type FactionFormData = z.infer<typeof factionSchema>;

interface FactionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FactionFormData) => void;
  campaignId: string;
  mode: 'create' | 'edit';
  faction?: FactionDTO | null;
  isSubmitting?: boolean;
}

/**
 * Dialog for creating/editing factions
 * - Name (required)
 * - Image (optional, max 5MB)
 * - Description (RichTextEditor with @mentions)
 * - Goals (RichTextEditor with @mentions)
 */
export function FactionFormDialog({
  isOpen,
  onClose,
  onSubmit,
  campaignId,
  mode,
  faction,
  isSubmitting = false,
}: FactionFormDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FactionFormData>({
    resolver: zodResolver(factionSchema),
    defaultValues: {
      name: faction?.name || '',
      description_json: faction?.description_json || null,
      goals_json: faction?.goals_json || null,
      image_url: faction?.image_url || null,
    },
  });

  const imageUrl = watch('image_url');
  const descriptionJson = watch('description_json');
  const goalsJson = watch('goals_json');

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: FactionFormData) => {
    onSubmit(data);
    if (mode === 'create') {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Faction' : 'Edit Faction'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new faction with description and goals.'
              : 'Update faction information.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter faction name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Image */}
          <div>
            <Label>Image</Label>
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setValue('image_url', url)}
              campaignId={campaignId}
              entityType="faction"
              maxSizeMB={5}
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <RichTextEditor
              value={descriptionJson as JSONContent | null}
              onChange={(json) => setValue('description_json', json)}
              campaignId={campaignId}
              placeholder="Describe the faction..."
              className="min-h-[120px]"
              readonly={isSubmitting}
            />
          </div>

          {/* Goals */}
          <div>
            <Label>Goals</Label>
            <RichTextEditor
              value={goalsJson as JSONContent | null}
              onChange={(json) => setValue('goals_json', json)}
              campaignId={campaignId}
              placeholder="What are the faction's goals and objectives?"
              className="min-h-[120px]"
              readonly={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Faction' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
