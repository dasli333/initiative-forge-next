'use client';

import Image from 'next/image';
import { HelpCircle, Users, User, Building, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StoryItemDTO } from '@/types/story-items';

interface StoryItemCardProps {
  item: StoryItemDTO;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Get owner type icon
 */
function getOwnerTypeIcon(type: string | null) {
  switch (type) {
    case 'npc':
      return <User className="h-3 w-3" />;
    case 'player_character':
      return <Users className="h-3 w-3" />;
    case 'faction':
      return <Building className="h-3 w-3" />;
    case 'location':
      return <MapPin className="h-3 w-3" />;
    case 'unknown':
      return <HelpCircle className="h-3 w-3" />;
    default:
      return null;
  }
}

/**
 * Get owner type label
 */
function getOwnerTypeLabel(type: string | null): string {
  switch (type) {
    case 'npc':
      return 'NPC';
    case 'player_character':
      return 'PC';
    case 'faction':
      return 'Faction';
    case 'location':
      return 'Location';
    case 'unknown':
      return 'Unknown';
    default:
      return 'No Owner';
  }
}

/**
 * Horizontal card for story item in list
 * Image thumbnail (left) + content (right)
 */
export function StoryItemCard({ item, isSelected, onClick }: StoryItemCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex gap-3 p-3 rounded-lg border-2 transition-all text-left',
        'hover:border-emerald-400 dark:hover:border-emerald-600',
        isSelected
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-500'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      )}
    >
      {/* Image thumbnail */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-900">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <HelpCircle className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
          {item.name}
        </h3>

        {/* Owner badge */}
        {item.current_owner_type ? (
          <Badge
            variant={item.current_owner_type === 'unknown' ? 'secondary' : 'outline'}
            className="flex items-center gap-1 w-fit"
          >
            {getOwnerTypeIcon(item.current_owner_type)}
            <span className="text-xs">
              {item.current_owner_name || getOwnerTypeLabel(item.current_owner_type)}
            </span>
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            No Owner
          </Badge>
        )}
      </div>
    </button>
  );
}
