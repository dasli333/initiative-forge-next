'use client';

import { cn } from '@/lib/utils';

interface SidebarListItemProps {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export function SidebarListItem({
  isSelected,
  onClick,
  children,
  className,
  'data-testid': testId,
}: SidebarListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={cn(
        'w-full px-3 py-2.5 flex items-start gap-3 rounded-lg border transition-colors text-left',
        'hover:bg-accent/50',
        isSelected ? 'bg-primary/10 border-primary' : 'bg-card',
        className,
      )}
    >
      {children}
    </button>
  );
}
