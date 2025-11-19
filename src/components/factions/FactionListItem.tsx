'use client';

import { Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FactionCardViewModel } from '@/types/factions';

interface FactionListItemProps {
  faction: FactionCardViewModel;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Compact list item for Faction in left sidebar
 * Shows avatar/image, name, description excerpt, member count, and relationship indicators
 */
export function FactionListItem({ faction, isSelected, onClick }: FactionListItemProps) {
  const { memberCount, relationshipCounts } = faction;
  const totalRelationships =
    relationshipCounts.alliance +
    relationshipCounts.war +
    relationshipCounts.rivalry +
    relationshipCounts.neutral;

  // Extract plain text excerpt from description_json
  const getDescriptionExcerpt = () => {
    if (!faction.faction.description_json) return null;

    try {
      const content = faction.faction.description_json;
      if (content && typeof content === 'object' && 'content' in content) {
        const paragraphs = (content.content as Array<{ content?: Array<{ text?: string }> }>);
        for (const p of paragraphs) {
          if (p.content && p.content[0]?.text) {
            return p.content[0].text.slice(0, 60) + (p.content[0].text.length > 60 ? '...' : '');
          }
        }
      }
    } catch {
      return null;
    }
    return null;
  };

  const excerpt = getDescriptionExcerpt();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full px-3 py-2.5 flex items-start gap-3 rounded-lg border transition-colors text-left',
        'hover:bg-accent/50',
        isSelected
          ? 'bg-primary/10 border-primary'
          : 'bg-card'
      )}
    >
      {/* Avatar/Image */}
      <div className="shrink-0">
        {faction.faction.image_url ? (
          <img
            src={faction.faction.image_url}
            alt={faction.faction.name}
            className="w-12 h-12 rounded-md object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
            <Shield className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name */}
        <div className="font-medium truncate">{faction.faction.name}</div>

        {/* Description excerpt */}
        {excerpt && (
          <div className="text-xs text-muted-foreground truncate mt-0.5">{excerpt}</div>
        )}

        {/* Meta info */}
        <div className="mt-1.5 flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
          {/* Member count */}
          {memberCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Users className="w-3 h-3" />
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
          )}

          {/* Relationship indicators */}
          {totalRelationships > 0 && (
            <span className="inline-flex items-center gap-1.5">
              {relationshipCounts.alliance > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400" title="Alliances">
                  🤝 {relationshipCounts.alliance}
                </span>
              )}
              {relationshipCounts.war > 0 && (
                <span className="text-red-600 dark:text-red-400" title="Wars">
                  ⚔️ {relationshipCounts.war}
                </span>
              )}
              {relationshipCounts.rivalry > 0 && (
                <span className="text-orange-600 dark:text-orange-400" title="Rivalries">
                  ⚡ {relationshipCounts.rivalry}
                </span>
              )}
              {relationshipCounts.neutral > 0 && (
                <span className="text-gray-600 dark:text-gray-400" title="Neutral">
                  ⚖️ {relationshipCounts.neutral}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
