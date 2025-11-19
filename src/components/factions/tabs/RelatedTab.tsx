'use client';

import { Link } from 'lucide-react';
import type { BacklinkItem } from '@/types/factions';

interface RelatedTabProps {
  backlinks: BacklinkItem[];
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

export function RelatedTab({ backlinks, campaignId }: RelatedTabProps) {
  const groupedBacklinks = backlinks.reduce((acc, backlink) => {
    if (!acc[backlink.source_type]) {
      acc[backlink.source_type] = [];
    }
    acc[backlink.source_type].push(backlink);
    return acc;
  }, {} as Record<string, BacklinkItem[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Mentioned In ({backlinks.length})</h3>
      </div>

      {backlinks.length === 0 ? (
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
                    <div className="font-medium">{item.source_name || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      in {item.source_field.replace('_', ' ')}
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
