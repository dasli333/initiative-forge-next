'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { StoryItemsHeader } from '@/components/story-items/StoryItemsHeader';
import { StoryItemsLayout } from '@/components/story-items/StoryItemsLayout';
import { StoryItemFormDialog } from '@/components/story-items/forms/StoryItemFormDialog';
import { useCampaignStore } from '@/stores/campaignStore';
import {
  useStoryItemsQuery,
  useStoryItemQuery,
  useCreateStoryItemMutation,
  useUpdateStoryItemMutation,
  useDeleteStoryItemMutation,
} from '@/hooks/useStoryItems';
import { useNPCsQuery } from '@/hooks/useNpcs';
import { useCharacterCardsQuery } from '@/hooks/useCharacters';
import { useFactionsQuery } from '@/hooks/useFactions';
import { useLocationsQuery } from '@/hooks/useLocations';
import type { StoryItemDTO, StoryItemFilters } from '@/types/story-items';
import type { StoryItemFormData } from '@/lib/schemas/story-items';
import type { JSONContent } from '@tiptap/core';

/**
 * Main Story Items page
 * URL-driven selection pattern (30/70 split layout)
 */
export default function StoryItemsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = params.id as string;

  // Get campaign from store
  const { selectedCampaign } = useCampaignStore();

  // URL-driven selection
  const selectedId = searchParams.get('selectedId');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<StoryItemFilters>({});

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Partial<StoryItemDTO> | null>(null);

  // Queries
  const { data: items = [], isLoading: itemsLoading } = useStoryItemsQuery(campaignId, filters);
  const { data: detailItem, isLoading: detailLoading } = useStoryItemQuery(selectedId);
  const { data: npcs = [] } = useNPCsQuery(campaignId);
  const { data: playerCharacters = [] } = useCharacterCardsQuery(campaignId);
  const { data: factions = [] } = useFactionsQuery(campaignId);
  const { data: locations = [] } = useLocationsQuery(campaignId);

  // Mutations
  const createMutation = useCreateStoryItemMutation(campaignId);
  const updateMutation = useUpdateStoryItemMutation(campaignId);
  const deleteMutation = useDeleteStoryItemMutation(campaignId);

  // Prepare owner data for filters/forms (simplified - just id and name)
  const npcsSimple = npcs.map(npc => ({ id: npc.id, name: npc.name }));
  const pcsSimple = playerCharacters.map(pc => ({ id: pc.id, name: pc.name }));
  const factionsSimple = factions.map(f => ({ id: f.id, name: f.name }));
  const locationsSimple = locations.map(l => ({ id: l.id, name: l.name }));

  // Handlers
  const handleItemSelect = (id: string) => {
    router.push(`/campaigns/${campaignId}/story-items?selectedId=${id}`, { scroll: false });
  };

  const handleEdit = () => {
    if (detailItem) {
      setEditedData({
        name: detailItem.name,
        description_json: detailItem.description_json,
        image_url: detailItem.image_url,
        ownership_history_json: detailItem.ownership_history_json,
      });
      setIsEditing(true);
    }
  };

  const handleSave = (data: Partial<StoryItemDTO>) => {
    if (selectedId && detailItem) {
      const changes: Record<string, unknown> = {};

      // Compare each field with original
      if (data.name !== undefined && data.name !== detailItem.name) {
        changes.name = data.name;
      }
      if (data.image_url !== undefined && data.image_url !== detailItem.image_url) {
        changes.image_url = data.image_url;
      }
      if (data.description_json !== undefined &&
          JSON.stringify(data.description_json) !== JSON.stringify(detailItem.description_json)) {
        changes.description_json = data.description_json;
      }
      if (data.ownership_history_json !== undefined &&
          JSON.stringify(data.ownership_history_json) !== JSON.stringify(detailItem.ownership_history_json)) {
        changes.ownership_history_json = data.ownership_history_json;
      }

      // Update if there are changes
      if (Object.keys(changes).length > 0) {
        updateMutation.mutate({
          id: selectedId,
          command: changes,
        });
      }

      setIsEditing(false);
      setEditedData(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(null);
  };

  const handleEditedDataChange = (field: string, value: unknown) => {
    if (editedData) {
      setEditedData({ ...editedData, [field]: value });
    }
  };

  const handleDelete = () => {
    if (selectedId) {
      deleteMutation.mutate(selectedId, {
        onSuccess: () => {
          // Clear selection after delete
          router.push(`/campaigns/${campaignId}/story-items`, { scroll: false });
        },
      });
    }
  };

  const handleCreateSubmit = async (data: StoryItemFormData) => {
    await createMutation.mutateAsync({
      name: data.name!,
      description_json: data.description_json,
      image_url: data.image_url,
    });

    setIsCreateDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      {selectedCampaign && (
        <StoryItemsHeader
          campaign={selectedCampaign}
          onAddClick={() => setIsCreateDialogOpen(true)}
        />
      )}

        <StoryItemsLayout
            items={items}
            selectedId={selectedId}
            onItemSelect={handleItemSelect}
            campaignId={campaignId}
            npcs={npcsSimple}
            playerCharacters={pcsSimple}
            factions={factionsSimple}
            locations={locationsSimple}
            filters={filters}
            onFiltersChange={setFilters}
            isLoading={itemsLoading}
            detailItem={detailItem}
            isDetailLoading={detailLoading}
            isEditing={isEditing}
            editedData={editedData}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancelEdit={handleCancelEdit}
            onDelete={handleDelete}
            onEditedDataChange={handleEditedDataChange}
            isUpdating={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
        />

      {/* Create Dialog */}
      <StoryItemFormDialog
        isOpen={isCreateDialogOpen}
        campaignId={campaignId}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
}
