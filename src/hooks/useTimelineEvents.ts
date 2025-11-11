'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getTimelineEvents,
  getTimelineEvent,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
} from '@/lib/api/timeline-events';
import type { TimelineEventDTO, CreateTimelineEventCommand, UpdateTimelineEventCommand, TimelineEventFilters } from '@/types/timeline-events';

export function useTimelineEventsQuery(campaignId: string, filters?: TimelineEventFilters) {
  const router = useRouter();

  return useQuery({
    queryKey: ['timeline-events', campaignId, filters],
    queryFn: async (): Promise<TimelineEventDTO[]> => {
      try {
        return await getTimelineEvents(campaignId, filters);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!campaignId,
  });
}

export function useTimelineEventQuery(eventId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['timeline-event', eventId],
    queryFn: async (): Promise<TimelineEventDTO> => {
      if (!eventId) throw new Error('Timeline event ID is required');

      try {
        return await getTimelineEvent(eventId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!eventId,
  });
}

export function useCreateTimelineEventMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreateTimelineEventCommand): Promise<TimelineEventDTO> => {
      try {
        return await createTimelineEvent(campaignId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-events', campaignId] });
      toast.success('Timeline event created');
    },
    onError: (err) => {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Failed to create event' });
    },
  });
}

export function useUpdateTimelineEventMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, command }: { id: string; command: UpdateTimelineEventCommand }): Promise<TimelineEventDTO> => {
      try {
        return await updateTimelineEvent(id, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timeline-events', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['timeline-event', variables.id] });
      toast.success('Timeline event updated');
    },
    onError: (err) => {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Failed to update event' });
    },
  });
}

export function useDeleteTimelineEventMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        await deleteTimelineEvent(id);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['timeline-events', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['timeline-event', id] });
      toast.success('Timeline event deleted');
    },
    onError: () => {
      toast.error('Failed to delete timeline event');
    },
  });
}
