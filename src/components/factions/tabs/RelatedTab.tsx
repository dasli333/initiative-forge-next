'use client';

import { useQuery } from '@tanstack/react-query';
import { Link, Loader2 } from 'lucide-react';
import { getMentionsOf } from '@/lib/api/entity-mentions';

interface RelatedTabProps {
  factionId: string;
  campaignId: string;
}

const entityTypeIcons: Record<string, string> = {
  npc: '👤',
  quest: '📜',
  session: '🎲',
  location: '📍',
  faction: '🛡️',
  story_arc: '📖',
  lore_note: '📝',
  story_item: '💎',
  player_character: '⚔️',
};

export function RelatedTab({ factionId, campaignId }: RelatedTabProps) {
  // Query for backlinks (entities mentioning this faction)
  const { data: backlinks = [], isLoading } = useQuery({
    queryKey: ['entity-mentions', 'faction', factionId],
    queryFn: () => getMentionsOf('faction', factionId),
    enabled: !!factionId,
  });

  const groupedBacklinks = backlinks.reduce((acc, backlink) => {
    if (!acc[backlink.source_type]) {
      acc[backlink.source_type] = [];
    }
    acc[backlink.source_type].push(backlink);
    return acc;
  }, {} as Record<string, typeof backlinks>);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Mentioned In ({backlinks.length})</h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : backlinks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Not mentioned anywhere yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedBacklinks).map(([type, items]) => (
            <div key={type}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                {entityTypeIcons[type] || '📄'} {type.replace('_', ' ')}s ({items.length})
              </h4>
              <div className="space-y-1">
                {items.map((item) => (
                  <div
                    key={`${item.source_type}-${item.source_id}`}
                    className="text-sm p-2 rounded border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="font-medium capitalize">{item.source_type.replace('_', ' ')}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      Field: {item.source_field.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
