'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  getMentionsOf,
  getMentionsBy,
  createEntityMention,
  deleteMentionsBySource,
  batchCreateEntityMentions,
} from '@/lib/api/entity-mentions';
import type { EntityMention, CreateEntityMentionCommand } from '@/types/entity-mentions';

/**
 * Query hook for fetching backlinks (entities that mention this entity)
 */
export function useMentionsOfQuery(mentionedType: string | undefined, mentionedId: string | undefined) {
  const router = useRouter();

  return useQuery({
    queryKey: ['mentions-of', mentionedType, mentionedId],
    queryFn: async (): Promise<EntityMention[]> => {
      if (!mentionedType || !mentionedId) throw new Error('Mentioned type and ID are required');

      try {
        return await getMentionsOf(mentionedType, mentionedId);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!mentionedType && !!mentionedId,
  });
}

/**
 * Query hook for fetching forward links (entities mentioned by this entity)
 */
export function useMentionsByQuery(
  sourceType: string | undefined,
  sourceId: string | undefined,
  sourceField?: string
) {
  const router = useRouter();

  return useQuery({
    queryKey: ['mentions-by', sourceType, sourceId, sourceField],
    queryFn: async (): Promise<EntityMention[]> => {
      if (!sourceType || !sourceId) throw new Error('Source type and ID are required');

      try {
        return await getMentionsBy(sourceType, sourceId, sourceField);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    enabled: !!sourceType && !!sourceId,
  });
}

/**
 * Mutation hook for creating a single entity mention
 */
export function useCreateEntityMentionMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (command: CreateEntityMentionCommand): Promise<EntityMention> => {
      try {
        return await createEntityMention(command);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate backlinks for the mentioned entity
      queryClient.invalidateQueries({ queryKey: ['mentions-of', data.mentioned_type, data.mentioned_id] });
      // Invalidate forward links for the source entity
      queryClient.invalidateQueries({ queryKey: ['mentions-by', data.source_type, data.source_id] });
    },
    onError: (err) => {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Failed to create mention' });
    },
  });
}

/**
 * Mutation hook for deleting mentions by source
 * Used before updating rich text to clear old mentions
 */
export function useDeleteMentionsBySourceMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      sourceType,
      sourceId,
      sourceField
    }: {
      sourceType: string;
      sourceId: string;
      sourceField: string;
    }): Promise<void> => {
      try {
        await deleteMentionsBySource(sourceType, sourceId, sourceField);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate mentions-by query for this source
      queryClient.invalidateQueries({ queryKey: ['mentions-by', variables.sourceType, variables.sourceId] });
      // Note: We can't invalidate specific "mentions-of" queries without knowing which entities were mentioned
      // Consider invalidating all mentions-of queries or tracking them separately
    },
  });
}

/**
 * Mutation hook for batch creating entity mentions
 * More efficient when updating rich text with multiple @mentions
 */
export function useBatchCreateEntityMentionsMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      campaignId,
      mentions
    }: {
      campaignId: string;
      mentions: CreateEntityMentionCommand[];
    }): Promise<EntityMention[]> => {
      try {
        return await batchCreateEntityMentions(campaignId, mentions);
      } catch (error) {
        if (error instanceof Error && error.message.includes('auth')) {
          router.push('/login');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate all affected queries
      data.forEach(mention => {
        queryClient.invalidateQueries({ queryKey: ['mentions-of', mention.mentioned_type, mention.mentioned_id] });
        queryClient.invalidateQueries({ queryKey: ['mentions-by', mention.source_type, mention.source_id] });
      });
    },
    onError: (err) => {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Failed to create mentions' });
    },
  });
}
