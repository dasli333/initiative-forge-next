'use client';

import { useQuery } from '@tanstack/react-query';
import { getMentionsOf } from '@/lib/api/entity-mentions';

interface RelatedTabProps {
  storyArcId: string;
  campaignId: string;
}

export function RelatedTab({ storyArcId, campaignId: _campaignId }: RelatedTabProps) {
  const { data: mentions = [], isLoading } = useQuery({
    queryKey: ['entity-mentions', 'story_arc', storyArcId],
    queryFn: () => getMentionsOf('story_arc', storyArcId),
    enabled: !!storyArcId,
  });

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Related Entities</h3>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : mentions.length === 0 ? (
        <p className="text-muted-foreground">
          This story arc is not mentioned anywhere yet
        </p>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {mentions.length} mention{mentions.length !== 1 ? 's' : ''} (feature in progress)
          </div>
        </div>
      )}
    </div>
  );
}
