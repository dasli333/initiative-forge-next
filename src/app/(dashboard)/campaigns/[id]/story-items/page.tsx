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
    setIsEditing(true);
  };

  const handleSave = (data: Partial<StoryItemDTO>) => {
    if (selectedId) {
      updateMutation.mutate({
        id: selectedId,
        command: data,
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
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
            onEdit={handleEdit}
            onSave={handleSave}
            onCancelEdit={handleCancelEdit}
            onDelete={handleDelete}
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
