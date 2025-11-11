'use client';

import { useEffect } from 'react';
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
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { createStoryArcSchema, type StoryArcFormData } from '@/lib/schemas/story-arcs';
import { useCreateStoryArcMutation } from '@/hooks/useStoryArcs';

interface StoryArcFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
}

export function StoryArcFormDialog({
  isOpen,
  onClose,
  campaignId,
}: StoryArcFormDialogProps) {
  const createMutation = useCreateStoryArcMutation(campaignId);

  const form = useForm<StoryArcFormData>({
    resolver: zodResolver(createStoryArcSchema),
    defaultValues: {
      title: '',
      status: 'planning',
      start_date: null,
      end_date: null,
      description_json: null,
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, reset } = form;

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: StoryArcFormData) => {
    try {
      await createMutation.mutateAsync(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create story arc:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Story Arc</DialogTitle>
          <DialogDescription>
            Organize quests into narrative threads
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-auto">
          <div className="space-y-4 px-1">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="The Dragon Conspiracy"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(val) => setValue('status', val as 'planning' | 'active' | 'completed' | 'abandoned')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  {...register('start_date')}
                  placeholder="1 Hammer, 1492 DR"
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  {...register('end_date')}
                  placeholder="15 Mirtul, 1492 DR"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <RichTextEditor
                value={watch('description_json')}
                onChange={(val) => setValue('description_json', val)}
                campaignId={campaignId}
                placeholder="Describe the story arc..."
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Story Arc'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
