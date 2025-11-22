'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getLoreNoteTags,
  getLoreNoteTag,
  createLoreNoteTag,
  updateLoreNoteTag,
  deleteLoreNoteTag,
  getLoreNoteAssignedTags,
  assignTagToLoreNote,
  unassignTagFromLoreNote,
  bulkAssignTagsToLoreNote,
} from '@/lib/api/lore-note-tags';
import type {
  LoreNoteTagDTO,
  CreateLoreNoteTagCommand,
  UpdateLoreNoteTagCommand,
  AssignTagToLoreNoteCommand,
  UnassignTagFromLoreNoteCommand,
} from '@/types/lore-note-tags';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * React Query hook for fetching all tags for a campaign
 */
export function useLoreNoteTagsQuery(campaignId: string) {
  const router = useRouter();

  return useQuery({
    queryKey: ['lore-note-tags', campaignId],
    queryFn: async (): Promise<LoreNoteTagDTO[]> => {
      try {
        return await getLoreNoteTags(campaignId);
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
export function useLoreNoteTagQuery(tagId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['lore-note-tag', tagId],
    queryFn: async (): Promise<LoreNoteTagDTO> => {
      if (!tagId) throw new Error('Tag ID is required');

      try {
        return await getLoreNoteTag(tagId);
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
 * React Query hook for fetching tags assigned to a lore note
 */
export function useLoreNoteAssignedTagsQuery(loreNoteId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['lore-note-assigned-tags', loreNoteId],
    queryFn: async (): Promise<LoreNoteTagDTO[]> => {
      if (!loreNoteId) throw new Error('Lore note ID is required');

      try {
        return await getLoreNoteAssignedTags(loreNoteId);
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

// ============================================================================
// MUTATION HOOKS - TAG MANAGEMENT
// ============================================================================

/**
 * Mutation hook for creating a new tag
 */
export function useCreateLoreNoteTagMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (
      command: CreateLoreNoteTagCommand
    ): Promise<LoreNoteTagDTO> => {
      try {
        return await createLoreNoteTag(campaignId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate tags list
      queryClient.invalidateQueries({
        queryKey: ['lore-note-tags', campaignId],
      });
      toast.success('Tag created successfully');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create tag'
      );
    },
  });
}

/**
 * Mutation hook for updating a tag
 */
export function useUpdateLoreNoteTagMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      tagId,
      command,
    }: {
      tagId: string;
      command: UpdateLoreNoteTagCommand;
    }): Promise<LoreNoteTagDTO> => {
      try {
        return await updateLoreNoteTag(tagId, command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (updatedTag) => {
      // Invalidate tags list and specific tag
      queryClient.invalidateQueries({
        queryKey: ['lore-note-tags', updatedTag.campaign_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['lore-note-tag', updatedTag.id],
      });
      // Also invalidate lore notes list to refresh tag badges
      queryClient.invalidateQueries({
        queryKey: ['lore-notes', updatedTag.campaign_id],
      });
      toast.success('Tag updated successfully');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update tag'
      );
    },
  });
}

/**
 * Mutation hook for deleting a tag
 */
export function useDeleteLoreNoteTagMutation(campaignId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (tagId: string): Promise<void> => {
      try {
        await deleteLoreNoteTag(tagId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate tags list
      queryClient.invalidateQueries({
        queryKey: ['lore-note-tags', campaignId],
      });
      // Invalidate lore notes list to refresh tag badges
      queryClient.invalidateQueries({ queryKey: ['lore-notes', campaignId] });
      toast.success('Tag deleted successfully');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete tag'
      );
    },
  });
}

// ============================================================================
// MUTATION HOOKS - TAG ASSIGNMENTS
// ============================================================================

/**
 * Mutation hook for assigning a tag to a lore note
 */
export function useAssignTagToLoreNoteMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (
      command: AssignTagToLoreNoteCommand
    ): Promise<void> => {
      try {
        await assignTagToLoreNote(command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate lore note's assigned tags
      queryClient.invalidateQueries({
        queryKey: ['lore-note-assigned-tags', variables.lore_note_id],
      });
      // Invalidate lore note details to refresh tag badges
      queryClient.invalidateQueries({
        queryKey: ['lore-note', variables.lore_note_id],
      });
      toast.success('Tag assigned successfully');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to assign tag'
      );
    },
  });
}

/**
 * Mutation hook for unassigning a tag from a lore note
 */
export function useUnassignTagFromLoreNoteMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (
      command: UnassignTagFromLoreNoteCommand
    ): Promise<void> => {
      try {
        await unassignTagFromLoreNote(command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate lore note's assigned tags
      queryClient.invalidateQueries({
        queryKey: ['lore-note-assigned-tags', variables.lore_note_id],
      });
      // Invalidate lore note details to refresh tag badges
      queryClient.invalidateQueries({
        queryKey: ['lore-note', variables.lore_note_id],
      });
      toast.success('Tag unassigned successfully');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to unassign tag'
      );
    },
  });
}

/**
 * Mutation hook for bulk assigning tags to a lore note
 * Replaces all existing tag assignments
 */
export function useBulkAssignTagsToLoreNoteMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      loreNoteId,
      tagIds,
    }: {
      loreNoteId: string;
      tagIds: string[];
    }): Promise<void> => {
      try {
        await bulkAssignTagsToLoreNote(loreNoteId, tagIds);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate lore note's assigned tags
      queryClient.invalidateQueries({
        queryKey: ['lore-note-assigned-tags', variables.loreNoteId],
      });
      // Invalidate lore note details to refresh tag badges
      queryClient.invalidateQueries({
        queryKey: ['lore-note', variables.loreNoteId],
      });
      toast.success('Tags updated successfully');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update tags'
      );
    },
  });
}
