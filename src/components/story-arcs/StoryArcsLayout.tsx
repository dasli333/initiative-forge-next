import { SplitLayout } from '@/components/shared/SplitLayout';
import { StoryArcsList } from './StoryArcsList';
import { StoryArcDetailPanel } from './StoryArcDetailPanel';
import type { StoryArcDTO, StoryArcFilters } from '@/types/story-arcs';
import type { QuestDTO } from '@/types/quests';
import type { EditedStoryArcData } from './tabs/DetailsTab';

interface StoryArcsLayoutProps {
  storyArcs: StoryArcDTO[];
  quests: QuestDTO[];
  selectedStoryArcId: string | null;
  onStoryArcSelect: (id: string) => void;
  filters: StoryArcFilters;
  onFiltersChange: (filters: StoryArcFilters) => void;
  isLoading: boolean;
  selectedStoryArc: StoryArcDTO | undefined;
  isDetailLoading: boolean;
  isEditing: boolean;
  editedData: EditedStoryArcData | null;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditedDataChange: (field: string, value: unknown) => void;
  campaignId: string;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function StoryArcsLayout({
  storyArcs,
  quests,
  selectedStoryArcId,
  onStoryArcSelect,
  filters,
  onFiltersChange,
  isLoading,
  selectedStoryArc,
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
}: StoryArcsLayoutProps) {
  return (
    <SplitLayout
      leftPanel={
        <StoryArcsList
          storyArcs={storyArcs}
          quests={quests}
          selectedStoryArcId={selectedStoryArcId}
          onStoryArcSelect={onStoryArcSelect}
          filters={filters}
          onFiltersChange={onFiltersChange}
          isLoading={isLoading}
        />
      }
      rightPanel={
        <StoryArcDetailPanel
          storyArcId={selectedStoryArcId}
          storyArc={selectedStoryArc}
          campaignId={campaignId}
          quests={quests}
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
      }
    />
  );
}
