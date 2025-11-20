'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, Loader2 } from 'lucide-react';
import { getMentionsOf, enrichMentionsWithNames } from '@/lib/api/entity-mentions';
import { formatFieldName } from '@/lib/utils/mentionUtils';

interface RelatedTabProps {
  factionId: string;
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

export function RelatedTab({ factionId }: RelatedTabProps) {
  // Query for backlinks (entities mentioning this faction)
  const { data: backlinks = [], isLoading } = useQuery({
    queryKey: ['entity-mentions', 'faction', factionId],
    queryFn: async () => {
      const mentions = await getMentionsOf('faction', factionId);
      return enrichMentionsWithNames(mentions);
    },
    enabled: !!factionId,
  });

  // First, deduplicate backlinks by source entity
  const deduplicatedBacklinks = useMemo(() => {
    const groups = new Map<string, {
      source_type: string;
      source_id: string;
      source_name?: string;
      fields: Set<string>;
    }>();

    backlinks.forEach((backlink) => {
      const key = `${backlink.source_type}-${backlink.source_id}`;
      const existing = groups.get(key);

      if (existing) {
        existing.fields.add(backlink.source_field);
      } else {
        groups.set(key, {
          source_type: backlink.source_type,
          source_id: backlink.source_id,
          source_name: backlink.source_name,
          fields: new Set([backlink.source_field]),
        });
      }
    });

    return Array.from(groups.values());
  }, [backlinks]);

  // Then group by type for display
  const groupedBacklinks = deduplicatedBacklinks.reduce((acc, backlink) => {
    if (!acc[backlink.source_type]) {
      acc[backlink.source_type] = [];
    }
    acc[backlink.source_type].push(backlink);
    return acc;
  }, {} as Record<string, typeof deduplicatedBacklinks>);

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
                {items.map((item) => {
                  const fieldsArray = Array.from(item.fields).map(formatFieldName);
                  const fieldsLabel = fieldsArray.length === 1 ? 'Field' : 'Fields';

                  return (
                    <div
                      key={`${item.source_type}-${item.source_id}`}
                      className="text-sm p-2 rounded border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="font-medium">{item.source_name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {item.source_type.replace('_', ' ')} · {fieldsLabel}: {fieldsArray.join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
