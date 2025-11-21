'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getLoreNotes,
  getLoreNote,
  createLoreNote,
  updateLoreNote,
  deleteLoreNote,
  searchLoreNotes,
} from '@/lib/api/lore-notes';
import type { LoreNoteDTO, CreateLoreNoteCommand, UpdateLoreNoteCommand, LoreNoteFilters } from '@/types/lore-notes';

export function useLoreNotesQuery(campaignId: string, filters?: LoreNoteFilters) {
  const router = useRouter();

  return useQuery({
    queryKey: ['lore-notes', campaignId, filters],
    queryFn: async (): Promise<LoreNoteDTO[]> => {
      try {
        return await getLoreNotes(campaignId, filters);
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

export function useLoreNoteQuery(loreNoteId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['lore-note', loreNoteId],
    queryFn: async (): Promise<LoreNoteDTO> => {
      if (!loreNoteId) throw new Error('Lore note ID is required');

      try {
        return await getLoreNote(loreNoteId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!loreNoteId,
  });
}

/**
 * React Query hook for searching lore notes
 */
export function useSearchLoreNotesQuery(campaignId: string, searchQuery: string) {
  const router = useRouter();

  return useQuery({
    queryKey: ['lore-notes-search', campaignId, searchQuery],
    queryFn: async (): Promise<LoreNoteDTO[]> => {
      try {
        return await searchLoreNotes(campaignId, searchQuery);
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

export function useCreateLoreNoteMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreateLoreNoteCommand): Promise<LoreNoteDTO> => {
      try {
        return await createLoreNote(campaignId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lore-notes', campaignId] });
      toast.success('Lore note created');
    },
    onError: (err) => {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Failed to create lore note' });
    },
  });
}

export function useUpdateLoreNoteMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, command }: { id: string; command: UpdateLoreNoteCommand }): Promise<LoreNoteDTO> => {
      try {
        return await updateLoreNote(id, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lore-notes', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['lore-note', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['entity-preview', 'lore_note', variables.id] });
      toast.success('Lore note updated');
    },
    onError: (err) => {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Failed to update lore note' });
    },
  });
}

export function useDeleteLoreNoteMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        await deleteLoreNote(id);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['lore-notes', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['lore-note', id] });
      toast.success('Lore note deleted');
    },
    onError: () => {
      toast.error('Failed to delete lore note');
    },
  });
}
