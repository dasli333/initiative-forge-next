'use client';

import Image from 'next/image';
import { Users, MapPin, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagBadge } from './shared/TagBadge';
import type { NPCCardViewModel } from '@/types/npcs';

interface NPCListItemProps {
  npc: NPCCardViewModel;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Compact list item for NPC in left sidebar
 * Shows avatar, name, role, faction, location, tags, and combat indicator
 */
export function NPCListItem({ npc, isSelected, onClick }: NPCListItemProps) {
  const statusColors = {
    alive: 'bg-emerald-500',
    dead: 'bg-red-500',
    unknown: 'bg-gray-400',
  };

  // Show max 2 tags in list, rest as "+N more"
  const visibleTags = npc.tags.slice(0, 2);
  const hiddenTagsCount = npc.tags.length - visibleTags.length;

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
      {/* Avatar */}
      <div className="relative shrink-0">
        {npc.npc.image_url ? (
          <Image
            src={npc.npc.image_url}
            alt={npc.npc.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-md object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        {/* Status indicator */}
        <div
          className={cn(
            'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background',
            statusColors[npc.npc.status]
          )}
          title={npc.npc.status}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name */}
        <div className="font-medium truncate">{npc.npc.name}</div>

        {/* Role */}
        {npc.npc.role && (
          <div className="text-xs text-muted-foreground truncate">{npc.npc.role}</div>
        )}

        {/* Meta info */}
        <div className="mt-1.5 flex flex-wrap gap-1.5 items-center text-xs text-muted-foreground">
          {/* Faction */}
          {npc.factionName && (
            <span className="inline-flex items-center gap-1 truncate max-w-[120px]">
              <Users className="w-3 h-3 shrink-0" />
              <span className="truncate">{npc.factionName}</span>
            </span>
          )}

          {/* Location */}
          {npc.locationName && (
            <span className="inline-flex items-center gap-1 truncate max-w-[120px]">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{npc.locationName}</span>
            </span>
          )}

          {/* Combat ready */}
          {npc.hasCombatStats && (
            <span
              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"
              title="Combat ready"
            >
              <Swords className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Tags */}
        {npc.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {visibleTags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="sm" />
            ))}
            {hiddenTagsCount > 0 && (
              <span className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                +{hiddenTagsCount}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
