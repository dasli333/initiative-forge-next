'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getNPCTags,
  getNPCTag,
  createNPCTag,
  updateNPCTag,
  deleteNPCTag,
  getNPCAssignedTags,
  assignTagToNPC,
  unassignTagFromNPC,
  bulkAssignTagsToNPC,
} from '@/lib/api/npc-tags';
import type {
  NPCTagDTO,
  CreateNPCTagCommand,
  UpdateNPCTagCommand,
  AssignTagToNPCCommand,
  UnassignTagFromNPCCommand,
} from '@/types/npc-tags';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * React Query hook for fetching all tags for a campaign
 */
export function useNPCTagsQuery(campaignId: string) {
  const router = useRouter();

  return useQuery({
    queryKey: ['npc-tags', campaignId],
    queryFn: async (): Promise<NPCTagDTO[]> => {
      try {
        return await getNPCTags(campaignId);
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

/**
 * React Query hook for fetching a single tag
 */
export function useNPCTagQuery(tagId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['npc-tag', tagId],
    queryFn: async (): Promise<NPCTagDTO> => {
      if (!tagId) throw new Error('Tag ID is required');

      try {
        return await getNPCTag(tagId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!tagId,
  });
}

/**
 * React Query hook for fetching tags assigned to an NPC
 */
export function useNPCAssignedTagsQuery(npcId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['npc-assigned-tags', npcId],
    queryFn: async (): Promise<NPCTagDTO[]> => {
      if (!npcId) throw new Error('NPC ID is required');

      try {
        return await getNPCAssignedTags(npcId);
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

// ============================================================================
// MUTATION HOOKS - TAG MANAGEMENT
// ============================================================================

/**
 * Mutation hook for creating a new tag
 */
export function useCreateNPCTagMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreateNPCTagCommand): Promise<NPCTagDTO> => {
      try {
        return await createNPCTag(campaignId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate tags list
      queryClient.invalidateQueries({ queryKey: ['npc-tags', campaignId] });
      toast.success('Tag created successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create tag');
    },
  });
}

/**
 * Mutation hook for updating a tag
 */
export function useUpdateNPCTagMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      tagId,
      command,
    }: {
      tagId: string;
      command: UpdateNPCTagCommand;
    }): Promise<NPCTagDTO> => {
      try {
        return await updateNPCTag(tagId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (updatedTag) => {
      // Invalidate tags list and specific tag
      queryClient.invalidateQueries({ queryKey: ['npc-tags', updatedTag.campaign_id] });
      queryClient.invalidateQueries({ queryKey: ['npc-tag', updatedTag.id] });
      // Also invalidate NPCs list to refresh tag badges
      queryClient.invalidateQueries({ queryKey: ['npcs', updatedTag.campaign_id] });
      toast.success('Tag updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update tag');
    },
  });
}

/**
 * Mutation hook for deleting a tag
 */
export function useDeleteNPCTagMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (tagId: string): Promise<void> => {
      try {
        await deleteNPCTag(tagId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate tags list
      queryClient.invalidateQueries({ queryKey: ['npc-tags', campaignId] });
      // Invalidate NPCs list to refresh tag badges
      queryClient.invalidateQueries({ queryKey: ['npcs', campaignId] });
      toast.success('Tag deleted successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete tag');
    },
  });
}

// ============================================================================
// MUTATION HOOKS - TAG ASSIGNMENTS
// ============================================================================

/**
 * Mutation hook for assigning a tag to an NPC
 */
export function useAssignTagToNPCMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: AssignTagToNPCCommand): Promise<void> => {
      try {
        await assignTagToNPC(command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate NPC's assigned tags
      queryClient.invalidateQueries({
        queryKey: ['npc-assigned-tags', variables.npc_id],
      });
      // Invalidate NPC details to refresh tag badges
      queryClient.invalidateQueries({ queryKey: ['npc', variables.npc_id] });
      toast.success('Tag assigned successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to assign tag');
    },
  });
}

/**
 * Mutation hook for unassigning a tag from an NPC
 */
export function useUnassignTagFromNPCMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: UnassignTagFromNPCCommand): Promise<void> => {
      try {
        await unassignTagFromNPC(command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate NPC's assigned tags
      queryClient.invalidateQueries({
        queryKey: ['npc-assigned-tags', variables.npc_id],
      });
      // Invalidate NPC details to refresh tag badges
      queryClient.invalidateQueries({ queryKey: ['npc', variables.npc_id] });
      toast.success('Tag unassigned successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to unassign tag');
    },
  });
}

/**
 * Mutation hook for bulk assigning tags to an NPC
 * Replaces all existing tag assignments
 */
export function useBulkAssignTagsToNPCMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      npcId,
      tagIds,
    }: {
      npcId: string;
      tagIds: string[];
    }): Promise<void> => {
      try {
        await bulkAssignTagsToNPC(npcId, tagIds);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate NPC's assigned tags
      queryClient.invalidateQueries({
        queryKey: ['npc-assigned-tags', variables.npcId],
      });
      // Invalidate NPC details to refresh tag badges
      queryClient.invalidateQueries({ queryKey: ['npc', variables.npcId] });
      toast.success('Tags updated successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update tags');
    },
  });
}
