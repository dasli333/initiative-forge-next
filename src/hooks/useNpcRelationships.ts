'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getNPCRelationships,
  createNPCRelationship,
  updateNPCRelationship,
  deleteNPCRelationship,
} from '@/lib/api/npc-relationships';
import type { NPCRelationship, CreateNPCRelationshipCommand, UpdateNPCRelationshipCommand } from '@/types/npc-relationships';

export function useNPCRelationshipsQuery(npcId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['npc-relationships', npcId],
    queryFn: async (): Promise<NPCRelationship[]> => {
      if (!npcId) throw new Error('NPC ID is required');

      try {
        return await getNPCRelationships(npcId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!npcId,
  });
}

export function useCreateNPCRelationshipMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreateNPCRelationshipCommand): Promise<NPCRelationship> => {
      try {
        return await createNPCRelationship(command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate for both NPCs involved
      queryClient.invalidateQueries({ queryKey: ['npc-relationships', data.npc_id_1] });
      queryClient.invalidateQueries({ queryKey: ['npc-relationships', data.npc_id_2] });
      toast.success('NPC relationship created');
    },
    onError: (err) => {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Failed to create relationship' });
    },
  });
}

export function useUpdateNPCRelationshipMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, command }: { id: string; command: UpdateNPCRelationshipCommand }): Promise<NPCRelationship> => {
      try {
        return await updateNPCRelationship(id, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['npc-relationships', data.npc_id_1] });
      queryClient.invalidateQueries({ queryKey: ['npc-relationships', data.npc_id_2] });
      toast.success('NPC relationship updated');
    },
    onError: (err) => {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Failed to update relationship' });
    },
  });
}

export function useDeleteNPCRelationshipMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ id, npc_id_1: _npc_id_1, npc_id_2: _npc_id_2 }: { id: string; npc_id_1: string; npc_id_2: string }): Promise<void> => {
      try {
        await deleteNPCRelationship(id);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['npc-relationships', variables.npc_id_1] });
      queryClient.invalidateQueries({ queryKey: ['npc-relationships', variables.npc_id_2] });
      toast.success('NPC relationship deleted');
    },
    onError: () => {
      toast.error('Failed to delete relationship');
    },
  });
}
