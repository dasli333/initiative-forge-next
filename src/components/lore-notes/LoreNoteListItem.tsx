'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getCategoryIcon, getCategoryColor, extractExcerpt } from '@/lib/utils/loreNoteUtils';
import type { LoreNoteDTO } from '@/types/lore-notes';

interface LoreNoteListItemProps {
  note: LoreNoteDTO;
  isSelected: boolean;
  onClick: () => void;
}

export function LoreNoteListItem({ note, isSelected, onClick }: LoreNoteListItemProps) {
  const excerpt = extractExcerpt(note.content_json, 100);

  // Show max 2 tags + "+N more"
  const visibleTags = note.tags.slice(0, 2);
  const remainingCount = note.tags.length - 2;

  // Render icon inline
  const renderCategoryIcon = () => {
    const Icon = getCategoryIcon(note.category as import('@/types/lore-notes').LoreNoteCategory);
    return <Icon className="h-4 w-4" />;
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        'relative flex h-auto w-full items-start gap-3 px-3 py-2.5 transition-colors',
        'hover:bg-accent/50',
        isSelected
          ? 'bg-primary/10 border-l-4 border-l-primary'
          : 'bg-card border-l-4 border-l-transparent'
      )}
      onClick={onClick}
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
      <div className="min-w-0 flex-1 space-y-1 text-left">
        {/* Title */}
        <h3 className="truncate font-medium">{note.title}</h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {excerpt}
          </p>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {visibleTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-blue-200 bg-blue-50 text-blue-600 text-xs"
              >
                {tag}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <span className="text-xs text-muted-foreground">
                +{remainingCount} more
              </span>
            )}
          </div>
        )}
      </div>
    </Button>
  );
}
