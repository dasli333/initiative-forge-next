'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { QuestCardViewModel } from '@/types/quests';

interface QuestListItemProps {
  quest: QuestCardViewModel;
  isSelected: boolean;
  onClick: () => void;
}

export function QuestListItem({ quest, isSelected, onClick }: QuestListItemProps) {
  const statusColors = {
    not_started: 'bg-gray-400',
    active: 'bg-emerald-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        'relative flex h-auto w-full items-start gap-3 border-l-4 px-3 py-2.5 transition-colors',
        'hover:bg-accent/50',
        isSelected
          ? 'border-l-primary bg-primary/10'
          : 'border-l-transparent bg-card'
      )}
      onClick={onClick}
    >
      {/* Status dot */}
      <div
        className={cn(
          'absolute left-2 top-2 h-2 w-2 rounded-full',
          statusColors[quest.quest.status]
        )}
      />

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1 pl-4 text-left">
        {/* Title + Quest Type badge */}
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium">{quest.quest.title}</h3>
          {quest.quest.quest_type === 'main' && (
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-emerald-600"
            >
              MAIN
            </Badge>
          )}
        </div>

        {/* Progress bar + text */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">
            {quest.objectivesProgress.completed}/{quest.objectivesProgress.total} objectives (
            {quest.objectivesProgress.percentage}%)
          </div>
          <Progress value={quest.objectivesProgress.percentage} className="h-1" />
        </div>

        {/* Meta info (Story Arc + Rewards) */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {quest.quest.story_arc_name && (
            <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-600">
              {quest.quest.story_arc_name}
            </Badge>
          )}
          {quest.rewardsSummary && (
            <div className="truncate">{quest.rewardsSummary}</div>
          )}
        </div>
      </div>
    </Button>
  );
}
