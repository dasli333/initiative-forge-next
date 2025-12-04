'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { createStoryItemSchema, type StoryItemFormData } from '@/lib/schemas/story-items';

interface Owner {
  id: string;
  name: string;
}

interface StoryItemFormDialogProps {
  isOpen: boolean;
  campaignId: string;
  npcs: Owner[];
  playerCharacters: Owner[];
  factions: Owner[];
  locations: Owner[];
  onClose: () => void;
  onSubmit: (data: StoryItemFormData) => Promise<void>;
}

export function StoryItemFormDialog({
  isOpen,
  campaignId,
  npcs,
  playerCharacters,
  factions,
  locations,
  onClose,
  onSubmit,
}: StoryItemFormDialogProps) {
  const form = useForm<StoryItemFormData>({
    resolver: zodResolver(createStoryItemSchema),
    defaultValues: {
      name: '',
      description_json: null,
      image_url: null,
      current_owner_type: null,
      current_owner_id: null,
    },
  });

  const watchOwnerType = form.watch('current_owner_type');

  // Get owner options based on selected type
  const getOwnerOptions = () => {
    switch (watchOwnerType) {
      case 'npc':
        return npcs;
      case 'player_character':
        return playerCharacters;
      case 'faction':
        return factions;
      case 'location':
        return locations;
      default:
        return [];
    }
  };

  const ownerOptions = getOwnerOptions();
  const showOwnerSelect = watchOwnerType && watchOwnerType !== 'unknown';

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const handleSubmit = async (data: StoryItemFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Story Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name of the story item" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description_json"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      campaignId={campaignId}
                      placeholder="Describe this story item..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image */}
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      campaignId={campaignId}
                      entityType="story_item"
                      maxSizeMB={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Owner Type */}
            <FormField
              control={form.control}
              name="current_owner_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Owner Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      if (value === 'none') {
                        field.onChange(null);
                        form.setValue('current_owner_id', null);
                      } else {
                        field.onChange(value);
                        form.setValue('current_owner_id', null); // Reset owner ID
                      }
                    }}
                    defaultValue={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Owner</SelectItem>
                      <SelectItem value="npc">NPC</SelectItem>
                      <SelectItem value="player_character">Player Character</SelectItem>
                      <SelectItem value="faction">Faction</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Owner ID (conditional) */}
            {showOwnerSelect && (
              <FormField
                control={form.control}
                name="current_owner_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Owner *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ownerOptions.map((owner) => (
                          <SelectItem key={owner.id} value={owner.id}>
                            {owner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {form.formState.isSubmitting ? 'Creating...' : 'Create Story Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
