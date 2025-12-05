'use client';

import { cn } from '@/lib/utils';
import { getCategoryIcon, getCategoryColor } from '@/lib/utils/loreNoteUtils';
import { TagBadge } from './shared/TagBadge';
import type { LoreNoteCardViewModel } from '@/types/lore-notes';

interface LoreNoteListItemProps {
  noteVM: LoreNoteCardViewModel;
  isSelected: boolean;
  onClick: () => void;
}

export function LoreNoteListItem({ noteVM, isSelected, onClick }: LoreNoteListItemProps) {
  const { note, tags } = noteVM;

  // Render icon inline
  const renderCategoryIcon = () => {
    const Icon = getCategoryIcon(note.category as import('@/types/lore-notes').LoreNoteCategory);
    return <Icon className="h-4 w-4" />;
  };

  // Show max 2 tags in list, rest as "+N more"
  const visibleTags = tags.slice(0, 2);
  const hiddenTagsCount = tags.length - visibleTags.length;

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
      {/* Category Icon */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border',
          getCategoryColor(note.category as import('@/types/lore-notes').LoreNoteCategory)
        )}
      >
        {renderCategoryIcon()}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Title */}
        <div className="truncate font-medium">{note.title}</div>

        {/* Tags */}
        {tags.length > 0 && (
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
