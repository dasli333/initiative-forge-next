'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getMentionsOf } from '@/lib/api/entity-mentions';
import type { EntityMention } from '@/types/entity-mentions';

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
