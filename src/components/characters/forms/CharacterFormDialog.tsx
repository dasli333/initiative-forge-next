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
import { characterFormSchema, type CharacterFormData } from '@/lib/schemas/player-character.schema';
import type { PlayerCharacterStatus } from '@/types/player-characters';

interface CharacterFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CharacterFormData) => void;
  mode: 'create' | 'edit';
  initialData?: Partial<CharacterFormData>;
  isSubmitting: boolean;
}

/**
 * Simplified dialog for creating/editing player characters
 * - Basic Info only (name*, class, level, race, status)
 * - Biography/personality/combat/relationships edited in detail panel after creation
 */
export function CharacterFormDialog({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  isSubmitting = false,
}: CharacterFormDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CharacterFormData>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      class: initialData?.class || null,
      level: initialData?.level || null,
      race: initialData?.race || null,
      status: initialData?.status || 'active',
    },
  });

  const selectedStatus = watch('status');

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: CharacterFormData) => {
    // Convert empty strings to null for optional fields
    const processedData: CharacterFormData = {
      ...data,
      class: data.class?.trim() || null,
      race: data.race?.trim() || null,
      level: data.level || null,
    };
    onSubmit(processedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Character' : 'Edit Character'}
          </DialogTitle>
          <DialogDescription>
            Fill in basic information. You can add biography, personality, and combat stats later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter character name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Grid: Class, Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class">Class</Label>
              <Input
                id="class"
                {...register('class')}
                placeholder="e.g., Fighter"
                disabled={isSubmitting}
              />
              {errors.class && (
                <p className="text-xs text-destructive mt-1">{errors.class.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                type="number"
                {...register('level', { valueAsNumber: true })}
                placeholder="1-20"
                min={1}
                max={20}
                disabled={isSubmitting}
              />
              {errors.level && (
                <p className="text-xs text-destructive mt-1">{errors.level.message}</p>
              )}
            </div>
          </div>

          {/* Race */}
          <div>
            <Label htmlFor="race">Race</Label>
            <Input
              id="race"
              {...register('race')}
              placeholder="e.g., Human, Elf"
              disabled={isSubmitting}
            />
            {errors.race && (
              <p className="text-xs text-destructive mt-1">{errors.race.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={selectedStatus}
              onValueChange={(value: PlayerCharacterStatus) => setValue('status', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="deceased">Deceased</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Character' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
