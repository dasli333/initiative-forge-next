'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Calendar, Gamepad2, Target } from 'lucide-react';
import type { SessionDTO, SessionStatus } from '@/types/sessions';
import { calculateGoalsProgress } from '@/lib/api/sessions';

interface SessionCardProps {
  session: SessionDTO;
  isSelected: boolean;
  onClick: () => void;
}

const statusConfig: Record<SessionStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
  },
  ready: {
    label: 'Ready',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
};

export function SessionCard({ session, isSelected, onClick }: SessionCardProps) {
  const status = (session.status as SessionStatus) || 'draft';
  const config = statusConfig[status];
  const goalsProgress = calculateGoalsProgress(session.plan_json);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-lg border p-3 text-left transition-colors',
        'hover:border-primary/50 hover:bg-accent/50',
        isSelected && 'border-primary bg-accent'
      )}
    >
      {/* Header row: Session # + Status */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm">
          Session #{session.session_number}
        </span>
        <Badge variant="secondary" className={cn('text-xs', config.className)}>
          {config.label}
        </Badge>
      </div>

      {/* Title */}
      {session.title && (
        <p className="mt-1 text-sm text-foreground truncate">
          {session.title}
        </p>
      )}

      {/* Meta row: dates + goals */}
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        {/* Session date */}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(session.session_date)}
        </span>

        {/* In-game date */}
        {session.in_game_date && (
          <span className="flex items-center gap-1">
            <Gamepad2 className="h-3 w-3" />
            {session.in_game_date}
          </span>
        )}

        {/* Goals progress */}
        {goalsProgress.total > 0 && (
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {goalsProgress.completed}/{goalsProgress.total}
          </span>
        )}
      </div>
    </button>
  );
}
