'use client';

import { SplitLayout } from '@/components/shared/SplitLayout';
import { StoryItemsList } from './StoryItemsList';
import { StoryItemDetailPanel } from './StoryItemDetailPanel';
import type { StoryItemDTO, StoryItemFilters } from '@/types/story-items';

interface Owner {
  id: string;
  name: string;
}

interface StoryItemsLayoutProps {
  items: StoryItemDTO[];
  selectedId: string | null;
  onItemSelect: (id: string) => void;
  campaignId: string;
  npcs: Owner[];
  playerCharacters: Owner[];
  factions: Owner[];
  locations: Owner[];
  filters: StoryItemFilters;
  onFiltersChange: (filters: StoryItemFilters) => void;
  isLoading: boolean;
  // Detail panel props
  detailItem: StoryItemDTO | undefined;
  isDetailLoading: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: Partial<StoryItemDTO>) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

/**
 * Main layout container for Story Items view
 * 30% list (left) | 70% detail panel (right)
 * Similar pattern to NPCsLayout
 */
export function StoryItemsLayout({
  items,
  selectedId,
  onItemSelect,
  campaignId,
  npcs,
  playerCharacters,
  factions,
  locations,
  filters,
  onFiltersChange,
  isLoading,
  detailItem,
  isDetailLoading,
  isEditing,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: StoryItemsLayoutProps) {
  return (
    <SplitLayout
      leftPanel={
        <StoryItemsList
          items={items}
          selectedId={selectedId}
          onItemSelect={onItemSelect}
          filters={filters}
          onFiltersChange={onFiltersChange}
          isLoading={isLoading}
          npcs={npcs}
          playerCharacters={playerCharacters}
          factions={factions}
          locations={locations}
        />
      }
      rightPanel={
        <StoryItemDetailPanel
          item={detailItem || null}
          isLoading={isDetailLoading}
          campaignId={campaignId}
          npcs={npcs}
          playerCharacters={playerCharacters}
          factions={factions}
          locations={locations}
          onEdit={onEdit}
          onSave={onSave}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
          isEditing={isEditing}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      }
    />
  );
}
