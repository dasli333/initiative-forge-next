'use client';

import { QuestsList } from './QuestsList';
import { QuestDetailPanel } from './QuestDetailPanel';
import type { QuestCardViewModel, QuestDetailsViewModel, QuestFilters } from '@/types/quests';
import type { NPCDTO } from '@/types/npcs';
import type { StoryArcDTO } from '@/types/story-arcs';
import type { JSONContent } from '@tiptap/core';
import type { QuestObjective, QuestRewards } from '@/types/quests';

interface QuestsLayoutProps {
  // List props
  quests: QuestCardViewModel[];
  selectedQuestId: string | null;
  onQuestSelect: (questId: string) => void;
  npcs: NPCDTO[];
  storyArcs: StoryArcDTO[];
  filters: QuestFilters;
  onFiltersChange: (filters: QuestFilters) => void;
  isLoading: boolean;

  // Detail panel props
  detailViewModel: QuestDetailsViewModel | undefined;
  isDetailLoading: boolean;
  isEditing: boolean;
  editedData: {
    title: string;
    quest_type: 'main' | 'side';
    quest_giver_id: string | null;
    story_arc_id: string | null;
    description_json: JSONContent | null;
    objectives_json: QuestObjective[] | null;
    rewards_json: QuestRewards | null;
    status: 'not_started' | 'active' | 'completed' | 'failed';
    notes: string | null;
    start_date: string | null;
    deadline: string | null;
  } | null;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditedDataChange: (field: string, value: unknown) => void;
  campaignId: string;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

/**
 * Split view layout: 30% list | 70% detail panel
 */
export function QuestsLayout({
  quests,
  selectedQuestId,
  onQuestSelect,
  npcs,
  storyArcs,
  filters,
  onFiltersChange,
  isLoading,
  detailViewModel,
  isDetailLoading,
  isEditing,
  editedData,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  onEditedDataChange,
  campaignId,
  isUpdating,
  isDeleting,
}: QuestsLayoutProps) {
  return (
    <div className="flex flex-1 gap-6 overflow-hidden">
      {/* LEFT PANEL - Quest List (30%) */}
      <div className="w-[30%] overflow-hidden border-r">
        <QuestsList
          quests={quests}
          selectedQuestId={selectedQuestId}
          onQuestSelect={onQuestSelect}
          npcs={npcs}
          storyArcs={storyArcs}
          filters={filters}
          onFiltersChange={onFiltersChange}
          isLoading={isLoading}
        />
      </div>

      {/* RIGHT PANEL - Detail Panel (70%) */}
      <div className="flex-1 overflow-hidden">
        <QuestDetailPanel
          questId={selectedQuestId}
          viewModel={detailViewModel}
          campaignId={campaignId}
          npcs={npcs}
          storyArcs={storyArcs}
          isLoading={isDetailLoading}
          isEditing={isEditing}
          editedData={editedData}
          onEdit={onEdit}
          onSave={onSave}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
          onEditedDataChange={onEditedDataChange}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
