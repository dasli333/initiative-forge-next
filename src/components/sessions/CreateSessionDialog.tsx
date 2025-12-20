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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createSessionSchema, type CreateSessionFormData } from '@/lib/schemas/sessions';

interface CreateSessionDialogProps {
  isOpen: boolean;
  nextSessionNumber: number;
  onClose: () => void;
  onSubmit: (data: CreateSessionFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function CreateSessionDialog({
  isOpen,
  nextSessionNumber,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateSessionDialogProps) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const form = useForm<CreateSessionFormData>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      session_number: nextSessionNumber,
      session_date: today,
      in_game_date: null,
      title: null,
    },
  });

  // Reset form when dialog opens with new values
  useEffect(() => {
    if (isOpen) {
      form.reset({
        session_number: nextSessionNumber,
        session_date: today,
        in_game_date: null,
        title: null,
      });
    }
  }, [isOpen, nextSessionNumber, form, today]);

  const handleSubmit = async (data: CreateSessionFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Session Number */}
            <FormField
              control={form.control}
              name="session_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Number</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Session Date */}
            <FormField
              control={form.control}
              name="session_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* In-Game Date (optional) */}
            <FormField
              control={form.control}
              name="in_game_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>In-Game Date (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 15 Mirtul, 1492 DR"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title (optional) */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., The Dragon's Lair"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Session'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
