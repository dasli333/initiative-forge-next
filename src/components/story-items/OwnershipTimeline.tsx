'use client';

import Link from 'next/link';
import { Users, User, Building, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OwnershipHistoryEntry } from '@/types/story-items';

interface OwnershipTimelineProps {
  entries: OwnershipHistoryEntry[];
  currentOwner: {
    type: 'npc' | 'player_character' | 'faction' | 'location';
    id: string;
    name: string;
  } | null;
  campaignId: string;
}

/**
 * Get owner type icon
 */
function getOwnerTypeIcon(type: string) {
  switch (type) {
    case 'npc':
      return <User className="h-4 w-4" />;
    case 'player_character':
      return <Users className="h-4 w-4" />;
    case 'faction':
      return <Building className="h-4 w-4" />;
    case 'location':
      return <MapPin className="h-4 w-4" />;
    default:
      return null;
  }
}

/**
 * Get owner type path for navigation
 */
function getOwnerTypePath(type: string, campaignId: string, ownerId: string): string {
  switch (type) {
    case 'npc':
      return `/campaigns/${campaignId}/npcs?selectedId=${ownerId}`;
    case 'player_character':
      return `/campaigns/${campaignId}/characters?selectedId=${ownerId}`;
    case 'faction':
      return `/campaigns/${campaignId}/factions?selectedId=${ownerId}`;
    case 'location':
      return `/campaigns/${campaignId}/locations?selectedId=${ownerId}`;
    default:
      return '#';
  }
}

/**
 * Get owner type label
 */
function getOwnerTypeLabel(type: string): string {
  switch (type) {
    case 'npc':
      return 'NPC';
    case 'player_character':
      return 'Player Character';
    case 'faction':
      return 'Faction';
    case 'location':
      return 'Location';
    default:
      return type;
  }
}

/**
 * Vertical timeline displaying ownership history
 * Chronological order (oldest → newest)
 */
export function OwnershipTimeline({ entries, currentOwner, campaignId }: OwnershipTimelineProps) {
  // Combine history entries with current owner
  const allEntries = [...entries];

  // Sort chronologically by "from" date
  const sortedEntries = allEntries.sort((a, b) => {
    if (!a.from || !b.from) return 0;
    return new Date(a.from).getTime() - new Date(b.from).getTime();
  });

  if (sortedEntries.length === 0 && !currentOwner) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        No ownership history available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedEntries.map((entry, index) => {
        const isCurrentOwner = entry.to === null;
        const period = isCurrentOwner
          ? `${entry.from || 'Unknown'} - Present`
          : `${entry.from || 'Unknown'} - ${entry.to || 'Unknown'}`;

        return (
          <div
            key={`${entry.owner_id}-${index}`}
            className="relative pl-8 pb-6 last:pb-0"
          >
            {/* Timeline line */}
            {index < sortedEntries.length - 1 && (
              <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
            )}

            {/* Timeline dot */}
            <div
              className={cn(
                'absolute left-0 top-1 w-4 h-4 rounded-full border-2',
                isCurrentOwner
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              )}
            />

            {/* Content card */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link
                  href={getOwnerTypePath(entry.owner_type, campaignId, entry.owner_id)}
                  className="font-medium text-gray-900 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {entry.owner_name || 'Unknown Owner'}
                </Link>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getOwnerTypeIcon(entry.owner_type)}
                  <span className="text-xs">{getOwnerTypeLabel(entry.owner_type)}</span>
                </Badge>
                {isCurrentOwner && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs">
                    Current
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {period}
              </p>

              {entry.notes && (
                <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                  {entry.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
