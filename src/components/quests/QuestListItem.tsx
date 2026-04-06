'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { SidebarListItem } from '@/components/shared/SidebarListItem';
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
    <SidebarListItem isSelected={isSelected} onClick={onClick} className="relative">
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
    </SidebarListItem>
  );
}
