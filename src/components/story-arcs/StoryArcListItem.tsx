import { StoryArcDTO } from '@/types/story-arcs';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoryArcListItemProps {
  storyArc: StoryArcDTO;
  questCount: number;
  isSelected: boolean;
  onClick: () => void;
}

const statusColors = {
  planning: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-green-100 text-green-700',
  abandoned: 'bg-red-100 text-red-700',
};

export function StoryArcListItem({ storyArc, questCount, isSelected, onClick }: StoryArcListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-lg border p-3 transition-colors',
        'hover:bg-accent/50',
        isSelected ? 'bg-primary/10 border-primary' : 'bg-card'
      )}
    >
      <div className="space-y-2">
        {/* Status Badge */}
        <Badge className={cn('text-xs', statusColors[storyArc.status])}>
          {storyArc.status}
        </Badge>

        {/* Title */}
        <h3 className="font-medium line-clamp-2 text-sm">{storyArc.title}</h3>

        {/* Quest Count */}
        {questCount > 0 && (
          <Badge variant="outline" className="text-xs">
            {questCount} quest{questCount !== 1 ? 's' : ''}
          </Badge>
        )}

        {/* Start Date */}
        {storyArc.start_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{storyArc.start_date}</span>
          </div>
        )}
      </div>
    </div>
  );
}
