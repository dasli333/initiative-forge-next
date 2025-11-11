'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getFactionRelationships,
  createFactionRelationship,
  updateFactionRelationship,
  deleteFactionRelationship,
} from '@/lib/api/faction-relationships';
import type { FactionRelationship, CreateFactionRelationshipCommand, UpdateFactionRelationshipCommand } from '@/types/faction-relationships';

export function useFactionRelationshipsQuery(factionId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['faction-relationships', factionId],
    queryFn: async (): Promise<FactionRelationship[]> => {
      if (!factionId) throw new Error('Faction ID is required');

      try {
        return await getFactionRelationships(factionId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!factionId,
  });
}

export function useCreateFactionRelationshipMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreateFactionRelationshipCommand): Promise<FactionRelationship> => {
      try {
        return await createFactionRelationship(command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate for both factions involved
      queryClient.invalidateQueries({ queryKey: ['faction-relationships', data.faction_id_1] });
      queryClient.invalidateQueries({ queryKey: ['faction-relationships', data.faction_id_2] });
      toast.success('Faction relationship created');
    },
    onError: (err) => {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Failed to create relationship' });
    },
  });
}

export function useUpdateFactionRelationshipMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, command }: { id: string; command: UpdateFactionRelationshipCommand }): Promise<FactionRelationship> => {
      try {
        return await updateFactionRelationship(id, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['faction-relationships', data.faction_id_1] });
      queryClient.invalidateQueries({ queryKey: ['faction-relationships', data.faction_id_2] });
      toast.success('Faction relationship updated');
    },
    onError: (err) => {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Failed to update relationship' });
    },
  });
}

export function useDeleteFactionRelationshipMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, faction_id_1: _faction_id_1, faction_id_2: _faction_id_2 }: { id: string; faction_id_1: string; faction_id_2: string }): Promise<void> => {
      try {
        await deleteFactionRelationship(id);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['faction-relationships', variables.faction_id_1] });
      queryClient.invalidateQueries({ queryKey: ['faction-relationships', variables.faction_id_2] });
      toast.success('Faction relationship deleted');
    },
    onError: () => {
      toast.error('Failed to delete relationship');
    },
  });
}
