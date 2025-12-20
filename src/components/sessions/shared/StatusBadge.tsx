'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SessionStatus } from '@/types/sessions';

interface StatusBadgeProps {
  status: SessionStatus;
  className?: string;
}

const statusConfig: Record<SessionStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  ready: {
    label: 'Ready',
    className: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-100 text-amber-700 border-amber-300',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-700 border-green-300',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
