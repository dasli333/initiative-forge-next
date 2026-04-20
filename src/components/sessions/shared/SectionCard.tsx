'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  compact?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export function SectionCard({
  title,
  description,
  children,
  headerAction,
  compact = false,
  collapsible = false,
  defaultCollapsed = false,
  className,
}: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);
  const showBody = !collapsible || isOpen;

  return (
    <Card className={cn('bg-muted/30', compact ? 'py-2' : 'py-4', className)}>
      <CardHeader className={cn(compact ? 'pb-1 pt-0' : 'pb-2 pt-0')}>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={!collapsible}
            onClick={() => collapsible && setIsOpen((v) => !v)}
            className={cn(
              'flex items-center gap-2 text-left min-w-0 flex-1',
              collapsible && 'cursor-pointer hover:text-foreground',
            )}
          >
            {collapsible && (
              isOpen
                ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{title}</CardTitle>
              {description && !compact && (
                <CardDescription className="text-xs">{description}</CardDescription>
              )}
            </div>
          </button>
          {headerAction}
        </div>
      </CardHeader>
      {showBody && (
        <CardContent className={cn('pt-0', compact && 'pb-2')}>
          {children}
        </CardContent>
      )}
    </Card>
  );
}
