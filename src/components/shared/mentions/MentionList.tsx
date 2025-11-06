'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { EntitySearchResult } from '@/lib/api/entities';
import { cn } from '@/lib/utils';
import {
  MapPin,
  User,
  Target,
  Calendar,
  BookOpen,
  Package,
  Users,
  FileText,
} from 'lucide-react';

interface MentionListProps {
  items: EntitySearchResult[];
  command: (item: EntitySearchResult) => void;
  campaignId: string;
}

const ENTITY_ICONS = {
  location: MapPin,
  npc: User,
  quest: Target,
  session: Calendar,
  story_arc: BookOpen,
  story_item: Package,
  faction: Users,
  lore_note: FileText,
};

const ENTITY_COLORS = {
  location: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
  npc: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
  quest: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
  session: 'text-purple-600 bg-purple-50 dark:bg-purple-950',
  story_arc: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950',
  story_item: 'text-orange-600 bg-orange-50 dark:bg-orange-950',
  faction: 'text-red-600 bg-red-50 dark:bg-red-950',
  lore_note: 'text-gray-600 bg-gray-50 dark:bg-gray-950',
};

export const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({
        id: item.id,
        label: item.label,
        entityType: item.entityType,
      } as EntitySearchResult);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  if (props.items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
          No entities found
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="max-h-80 overflow-y-auto p-1">
        {props.items.map((item, index) => {
          const Icon = ENTITY_ICONS[item.entityType];
          const colorClass = ENTITY_COLORS[item.entityType];

          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                'flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm transition-colors',
                index === selectedIndex
                  ? 'bg-gray-100 dark:bg-gray-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              )}
              onClick={() => selectItem(index)}
            >
              <div className={cn('rounded-full p-1.5', colorClass)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.label}
                </div>
                {item.excerpt && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.excerpt}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                {item.entityType.replace('_', ' ')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

MentionList.displayName = 'MentionList';
