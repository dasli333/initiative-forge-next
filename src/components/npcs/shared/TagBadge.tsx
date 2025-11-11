'use client';

import { X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NPCTagDTO } from '@/types/npc-tags';

interface TagBadgeProps {
  tag: NPCTagDTO;
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

/**
 * Visual badge for NPC tags with color and icon
 * Supports different sizes, clickable, and removable variants
 */
export function TagBadge({
  tag,
  size = 'md',
  removable = false,
  onRemove,
  onClick,
  className,
}: TagBadgeProps) {
  // Get icon component from lucide-react
  const IconComponent = LucideIcons[tag.icon] || LucideIcons.Tag;

  // Convert color to Tailwind classes (support both predefined and custom hex)
  const isHex = tag.color.startsWith('#');
  const colorClasses = isHex
    ? ''
    : `bg-${tag.color}-100 text-${tag.color}-800 border-${tag.color}-200 dark:bg-${tag.color}-900/30 dark:text-${tag.color}-300 dark:border-${tag.color}-700`;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-medium',
        sizeClasses[size],
        isHex ? 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200' : colorClasses,
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
      style={isHex ? { backgroundColor: tag.color + '20', borderColor: tag.color + '40', color: tag.color } : undefined}
    >
      <IconComponent size={iconSizes[size]} className="shrink-0" />
      <span className="truncate">{tag.name}</span>
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="shrink-0 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${tag.name} tag`}
        >
          <X size={iconSizes[size]} />
        </button>
      )}
    </span>
  );
}
