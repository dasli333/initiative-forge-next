'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { QuestListItem } from './QuestListItem';
import { QuestsFiltersCompact } from './QuestsFiltersCompact';
import type { QuestCardViewModel, QuestFilters } from '@/types/quests';
import type { NPCDTO } from '@/types/npcs';
import type { StoryArcDTO } from '@/types/story-arcs';

interface QuestsListProps {
  quests: QuestCardViewModel[];
  selectedQuestId: string | null;
  onQuestSelect: (questId: string) => void;
  npcs: NPCDTO[];
  storyArcs: StoryArcDTO[];
  filters: QuestFilters;
  onFiltersChange: (filters: QuestFilters) => void;
  isLoading: boolean;
}

type SortOption = 'recent' | 'name-asc' | 'name-desc' | 'priority' | 'progress';

export function QuestsList({
  quests,
  selectedQuestId,
  onQuestSelect,
  npcs,
  storyArcs,
  filters,
  onFiltersChange,
  isLoading,
}: QuestsListProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Client-side search & sort
  const filteredAndSortedQuests = useMemo(() => {
    // Filter by search
    let filtered = quests;
    if (localSearch) {
      const searchLower = localSearch.toLowerCase();
      filtered = quests.filter(
        (q) =>
          q.quest.title.toLowerCase().includes(searchLower) ||
          (q.quest.notes && q.quest.notes.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.quest.created_at).getTime() - new Date(a.quest.created_at).getTime();
        case 'name-asc':
          return a.quest.title.localeCompare(b.quest.title);
        case 'name-desc':
          return b.quest.title.localeCompare(a.quest.title);
        case 'priority': {
          const priorityMap: Record<string, number> = {
            active: 0,
            not_started: 1,
            completed: 2,
            failed: 3,
          };
          return priorityMap[a.quest.status] - priorityMap[b.quest.status];
        }
        case 'progress':
          return b.objectivesProgress.percentage - a.objectivesProgress.percentage;
        default:
          return 0;
      }
    });

    return sorted;
  }, [quests, localSearch, sortBy]);

  return (
    <div className="flex h-full flex-col">
      {/* Search bar */}
      <div className="px-3 pb-2 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quests..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Sort dropdown */}
      <div className="px-3 pb-2">
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="priority">Priority (Active first)</SelectItem>
            <SelectItem value="progress">Progress (%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filters */}
      <div className="border-b px-3 pb-3">
        <QuestsFiltersCompact
          filters={filters}
          storyArcs={storyArcs}
          onFiltersChange={onFiltersChange}
        />
      </div>

      {/* Scrollable list */}
      <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {!isLoading && filteredAndSortedQuests.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No quests found</p>
          </div>
        )}

        {!isLoading &&
          filteredAndSortedQuests.map((quest) => (
            <QuestListItem
              key={quest.quest.id}
              quest={quest}
              isSelected={quest.quest.id === selectedQuestId}
              onClick={() => onQuestSelect(quest.quest.id)}
            />
          ))}
      </div>

      {/* Footer stats */}
      <div className="border-t px-3 py-2 text-xs text-muted-foreground">
        Showing {filteredAndSortedQuests.length} of {quests.length} quests
      </div>
    </div>
  );
}
