'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  getTimelineEvents,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent
} from '@/lib/api/timeline-events';
import {
  TimelineEventDTO,
  CreateTimelineEventCommand,
  UpdateTimelineEventCommand,
  TimelineEventFilters
} from '@/types/timeline-events';
import { toast } from 'sonner';

export function useTimelineEventsQuery(
  campaignId: string,
  filters?: TimelineEventFilters
) {
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
    staleTime: 60 * 1000,
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
    onMutate: async (command) => {
      await queryClient.cancelQueries({ queryKey: ['timeline-events', campaignId] });

      const previousEvents = queryClient.getQueryData<TimelineEventDTO[]>(['timeline-events', campaignId]);

      if (previousEvents) {
        const tempEvent: TimelineEventDTO = {
          id: `temp-${Date.now()}`,
          campaign_id: campaignId,
          title: command.title,
          description_json: command.description_json || null,
          event_date: command.event_date,
          sort_date: command.sort_date,
          related_entities_json: command.related_entities_json || [],
          source_type: command.source_type || 'manual',
          source_id: command.source_id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData<TimelineEventDTO[]>(['timeline-events', campaignId], [...previousEvents, tempEvent]);
      }

      return { previousEvents };
    },
    onError: (err, _command, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['timeline-events', campaignId], context.previousEvents);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.';

      toast.error('Failed to create event', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('Event created', {
        description: 'Your timeline event has been created successfully.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-events', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['entity-mentions'], refetchType: 'active' });
    },
  });
}

export function useUpdateTimelineEventMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ eventId, command }: { eventId: string; command: UpdateTimelineEventCommand }): Promise<TimelineEventDTO> => {
      try {
        return await updateTimelineEvent(eventId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async ({ eventId, command }) => {
      await queryClient.cancelQueries({ queryKey: ['timeline-events', campaignId] });

      const previousEvents = queryClient.getQueryData<TimelineEventDTO[]>(['timeline-events', campaignId]);

      if (previousEvents) {
        const updatedEvents = previousEvents.map((event) =>
          event.id === eventId
            ? {
                ...event,
                title: command.title ?? event.title,
                description_json: command.description_json !== undefined ? command.description_json : event.description_json,
                event_date: command.event_date ?? event.event_date,
                sort_date: command.sort_date ?? event.sort_date,
                related_entities_json: command.related_entities_json !== undefined ? command.related_entities_json : event.related_entities_json,
                source_type: command.source_type !== undefined ? command.source_type : event.source_type,
                source_id: command.source_id !== undefined ? command.source_id : event.source_id,
                updated_at: new Date().toISOString(),
              }
            : event
        );

        queryClient.setQueryData<TimelineEventDTO[]>(['timeline-events', campaignId], updatedEvents);
      }

      return { previousEvents };
    },
    onError: (err, _variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['timeline-events', campaignId], context.previousEvents);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.';

      toast.error('Failed to update event', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('Event updated', {
        description: 'Your timeline event has been updated successfully.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-events', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['entity-mentions'], refetchType: 'active' });
    },
  });
}

export function useDeleteTimelineEventMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (eventId: string): Promise<void> => {
      try {
        return await deleteTimelineEvent(eventId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onMutate: async (eventId) => {
      await queryClient.cancelQueries({ queryKey: ['timeline-events', campaignId] });

      const previousEvents = queryClient.getQueryData<TimelineEventDTO[]>(['timeline-events', campaignId]);

      if (previousEvents) {
        queryClient.setQueryData<TimelineEventDTO[]>(
          ['timeline-events', campaignId],
          previousEvents.filter((event) => event.id !== eventId)
        );
      }

      return { previousEvents };
    },
    onError: (err, _eventId, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(['timeline-events', campaignId], context.previousEvents);
      }

      const errorMessage =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Network error. Please check your connection.'
          : err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.';

      toast.error('Failed to delete event', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('Event deleted', {
        description: 'Your timeline event has been deleted successfully.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline-events', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['entity-mentions'], refetchType: 'active' });
    },
  });
}
