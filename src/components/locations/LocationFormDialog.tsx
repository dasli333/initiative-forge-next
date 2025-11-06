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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { locationFormSchema, type LocationFormData } from '@/lib/schemas/locations';
import type { LocationDTO } from '@/types/locations';
import type { CreateLocationCommand, UpdateLocationCommand } from '@/types/locations';
import { useMemo, useEffect } from 'react';

interface LocationFormDialogProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: LocationDTO;
  parentLocationId?: string | null;
  locations: LocationDTO[]; // For parent select
  onClose: () => void;
  onSubmit: (data: CreateLocationCommand | UpdateLocationCommand) => Promise<void>;
}

const LOCATION_TYPES = [
  { value: 'kontynent', label: 'Continent' },
  { value: 'królestwo', label: 'Kingdom' },
  { value: 'miasto', label: 'City' },
  { value: 'budynek', label: 'Building' },
  { value: 'dungeon', label: 'Dungeon' },
  { value: 'inne', label: 'Other' },
];

export function LocationFormDialog({
  isOpen,
  mode,
  initialData,
  parentLocationId,
  locations,
  onClose,
  onSubmit,
}: LocationFormDialogProps) {
  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      location_type: (initialData?.location_type as LocationFormData['location_type']) || 'miasto',
      parent_location_id: parentLocationId || initialData?.parent_location_id || null,
      description_json: initialData?.description_json || null,
      image_url: initialData?.image_url || null,
    },
  });

  // Reset form when dialog opens with new parentLocationId
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: initialData?.name || '',
        location_type: (initialData?.location_type as LocationFormData['location_type']) || 'miasto',
        parent_location_id: parentLocationId || initialData?.parent_location_id || null,
        description_json: initialData?.description_json || null,
        image_url: initialData?.image_url || null,
      });
    }
  }, [isOpen, parentLocationId, initialData, form]);

  // Available parent locations (exclude self and children in edit mode)
  const availableParents = useMemo(() => {
    if (mode === 'create') {
      return locations;
    }
    // In edit mode, exclude the location itself and its descendants
    const excludedIds = new Set<string>([initialData!.id]);
    const addDescendants = (parentId: string) => {
      locations
        .filter((loc) => loc.parent_location_id === parentId)
        .forEach((child) => {
          excludedIds.add(child.id);
          addDescendants(child.id);
        });
    };
    addDescendants(initialData!.id);
    return locations.filter((loc) => !excludedIds.has(loc.id));
  }, [mode, initialData, locations]);

  const handleSubmit = async (data: LocationFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Failed to submit location:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Location' : 'Edit Location'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new location to your campaign'
              : 'Update location details'}
          </DialogDescription>
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
                    <Input placeholder="Location name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="location_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LOCATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Parent Location */}
            <FormField
              control={form.control}
              name="parent_location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="None (root location)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None (root location)</SelectItem>
                      {availableParents.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      placeholder="Describe this location..."
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
                    <ImageUpload value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={form.formState.isSubmitting}
              >
                {mode === 'create' ? 'Create Location' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
