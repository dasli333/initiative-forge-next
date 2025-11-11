import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Scroll } from 'lucide-react';
import { StoryArcListItem } from './StoryArcListItem';
import { StoryArcsFiltersCompact } from './StoryArcsFiltersCompact';
import type { StoryArcDTO, StoryArcFilters } from '@/types/story-arcs';
import type { QuestDTO } from '@/types/quests';

interface StoryArcsListProps {
  storyArcs: StoryArcDTO[];
  quests: QuestDTO[];
  selectedStoryArcId: string | null;
  onStoryArcSelect: (id: string) => void;
  filters: StoryArcFilters;
  onFiltersChange: (filters: StoryArcFilters) => void;
  isLoading: boolean;
}

export function StoryArcsList({
  storyArcs,
  quests,
  selectedStoryArcId,
  onStoryArcSelect,
  filters,
  onFiltersChange,
  isLoading,
}: StoryArcsListProps) {
  const filteredStoryArcs = useMemo(() => {
    return storyArcs.filter((arc) => {
      if (filters.status && arc.status !== filters.status) return false;
      return true;
    });
  }, [storyArcs, filters]);

  const getQuestCount = (storyArcId: string) => {
    return quests.filter((q) => q.story_arc_id === storyArcId).length;
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b px-4 py-3">
          <h2 className="text-lg font-semibold mb-3">Story Arcs</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h2 className="text-lg font-semibold mb-3">Story Arcs</h2>
        <StoryArcsFiltersCompact filters={filters} onFiltersChange={onFiltersChange} />
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {filteredStoryArcs.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4 py-8">
            <Scroll className="h-16 w-16 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {filters.status ? `No ${filters.status} story arcs` : 'No story arcs yet'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {filters.status
                  ? 'Try adjusting your filters'
                  : 'Use the "New Story Arc" button above to create your first story arc'}
              </p>
              {filters.status && (
                <Button variant="outline" onClick={() => onFiltersChange({})}>
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {filteredStoryArcs.map((arc) => (
              <StoryArcListItem
                key={arc.id}
                storyArc={arc}
                questCount={getQuestCount(arc.id)}
                isSelected={selectedStoryArcId === arc.id}
                onClick={() => onStoryArcSelect(arc.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
