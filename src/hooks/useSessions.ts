'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
} from '@/lib/api/sessions';
import type { Session, CreateSessionCommand, UpdateSessionCommand, SessionFilters } from '@/types/sessions';

export function useSessionsQuery(campaignId: string, filters?: SessionFilters) {
  const router = useRouter();

  return useQuery({
    queryKey: ['sessions', campaignId, filters],
    queryFn: async (): Promise<Session[]> => {
      try {
        return await getSessions(campaignId, filters);
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

export function useSessionQuery(sessionId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: async (): Promise<Session> => {
      if (!sessionId) throw new Error('Session ID is required');

      try {
        return await getSession(sessionId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!sessionId,
  });
}

export function useCreateSessionMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreateSessionCommand): Promise<Session> => {
      try {
        return await createSession(campaignId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', campaignId] });
      toast.success('Session created');
    },
    onError: (err) => {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Failed to create session' });
    },
  });
}

export function useUpdateSessionMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, command }: { id: string; command: UpdateSessionCommand }): Promise<Session> => {
      try {
        return await updateSession(id, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['session', variables.id] });
      toast.success('Session updated');
    },
    onError: (err) => {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Failed to update session' });
    },
  });
}

export function useDeleteSessionMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        await deleteSession(id);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['session', id] });
      toast.success('Session deleted');
    },
    onError: () => {
      toast.error('Failed to delete session');
    },
  });
}
