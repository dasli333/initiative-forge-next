'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { NPCsHeader } from '@/components/npcs/NPCsHeader';
import { NPCGrid } from '@/components/npcs/NPCGrid';
import { NPCsEmptyState } from '@/components/npcs/NPCsEmptyState';
import { NPCDetailSlideover } from '@/components/npcs/NPCDetailSlideover';
import { NPCFormDialog } from '@/components/npcs/forms/NPCFormDialog';
import { AddRelationshipDialog } from '@/components/npcs/forms/AddRelationshipDialog';
import { useCampaignStore } from '@/stores/campaignStore';
import {
  useNPCsQuery,
  useNPCDetailsQuery,
  useCreateNPCMutation,
  useUpdateNPCMutation,
  useUpsertNPCCombatStatsMutation,
  useDeleteNPCCombatStatsMutation,
  useCreateNPCRelationshipMutation,
  useUpdateNPCRelationshipMutation,
  useDeleteNPCRelationshipMutation,
} from '@/hooks/useNPCs';
import type { NPCFilters, NPCCardViewModel } from '@/types/npcs';
import type { NPCFormData } from '@/lib/schemas/npcs';

/**
 * Main NPCs page
 * - Root component orchestrating all subcomponents
 * - Local state: selectedNPCId, isSlideoverOpen, isCreateDialogOpen, editingNPCId, filters
 * - useNPCsQuery with filters
 * - Renders: NPCsHeader, NPCGrid OR NPCsEmptyState, NPCDetailSlideover, NPCFormDialog
 */
export default function NPCsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = params.id as string;

  // Get campaign from store
  const { selectedCampaign } = useCampaignStore();

  // Local state
  const [filters, setFilters] = useState<NPCFilters>({});
  const [selectedNPCId, setSelectedNPCId] = useState<string | null>(
    searchParams.get('selectedId') || null
  );
  const [isSlideoverOpen, setIsSlideoverOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddRelationshipOpen, setIsAddRelationshipOpen] = useState(false);
  const [editingNPCId, setEditingNPCId] = useState<string | null>(null);

  // Queries
  const { data: npcs, isLoading: npcsLoading } = useNPCsQuery(campaignId, filters);
  const { data: npcDetails, isLoading: detailsLoading } = useNPCDetailsQuery(selectedNPCId);

  // Mutations
  const createMutation = useCreateNPCMutation(campaignId);
  const updateMutation = useUpdateNPCMutation(campaignId);
  const upsertCombatStatsMutation = useUpsertNPCCombatStatsMutation();
  const deleteCombatStatsMutation = useDeleteNPCCombatStatsMutation();
  const createRelationshipMutation = useCreateNPCRelationshipMutation();
  const updateRelationshipMutation = useUpdateNPCRelationshipMutation();
  const deleteRelationshipMutation = useDeleteNPCRelationshipMutation();

  // Dummy data for factions and locations (replace with actual queries)
  const factions = []; // TODO: Replace with useFactions query
  const locations = []; // TODO: Replace with useLocations query

  // Handlers
  const handleCardClick = (npcId: string) => {
    setSelectedNPCId(npcId);
    setIsSlideoverOpen(true);
    router.push(`/campaigns/${campaignId}/npcs?selectedId=${npcId}`, { scroll: false });
  };

  const handleCloseSlideover = () => {
    setIsSlideoverOpen(false);
    setSelectedNPCId(null);
    router.push(`/campaigns/${campaignId}/npcs`, { scroll: false });
  };

  const handleEdit = () => {
    if (selectedNPCId) {
      setEditingNPCId(selectedNPCId);
      setIsCreateDialogOpen(true);
    }
  };

  const handleAddClick = () => {
    setEditingNPCId(null);
    setIsCreateDialogOpen(true);
  };

  const handleFormSubmit = (data: NPCFormData) => {
    if (editingNPCId) {
      // Update existing NPC
      updateMutation.mutate({
        id: editingNPCId,
        command: {
          name: data.name,
          role: data.role || null,
          faction_id: data.faction_id || null,
          current_location_id: data.current_location_id || null,
          status: data.status,
          image_url: data.image_url || null,
          biography_json: data.biography_json,
          personality_json: data.personality_json,
        },
      });

      // Update combat stats if provided
      if (data.addCombatStats && data.combatStats) {
        upsertCombatStatsMutation.mutate({
          npcId: editingNPCId,
          command: data.combatStats,
        });
      }
    } else {
      // Create new NPC
      createMutation.mutate(
        {
          name: data.name,
          role: data.role || null,
          faction_id: data.faction_id || null,
          current_location_id: data.current_location_id || null,
          status: data.status,
          image_url: data.image_url || null,
          biography_json: data.biography_json,
          personality_json: data.personality_json,
        },
        {
          onSuccess: (newNPC) => {
            // Add combat stats if provided
            if (data.addCombatStats && data.combatStats) {
              upsertCombatStatsMutation.mutate({
                npcId: newNPC.id,
                command: data.combatStats,
              });
            }
          },
        }
      );
    }
  };

  const handleFieldUpdate = (field: string, value: unknown) => {
    if (selectedNPCId) {
      updateMutation.mutate({
        id: selectedNPCId,
        command: { [field]: value },
      });
    }
  };

  const handleAddCombatStats = () => {
    if (selectedNPCId) {
      upsertCombatStatsMutation.mutate({
        npcId: selectedNPCId,
        command: {
          hp_max: 10,
          armor_class: 10,
          speed: 30,
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
          actions_json: null,
        },
      });
    }
  };

  const handleRemoveCombatStats = () => {
    if (selectedNPCId) {
      deleteCombatStatsMutation.mutate(selectedNPCId);
    }
  };

  // Convert NPCs to card view models
  const npcCardViewModels: NPCCardViewModel[] =
    npcs?.map((npc) => ({
      npc,
      hasCombatStats: false, // TODO: Check if combat stats exist
      factionName: undefined, // TODO: Extract from JOINs
      locationName: undefined, // TODO: Extract from JOINs
    })) || [];

  if (!selectedCampaign) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading campaign...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <NPCsHeader
        campaignName={selectedCampaign.name}
        factions={factions}
        locations={locations}
        filters={filters}
        onFilterChange={setFilters}
        onAddClick={handleAddClick}
      />

      {/* Grid or Empty State */}
      {npcsLoading ? (
        <NPCGrid viewModels={[]} onCardClick={handleCardClick} isLoading={true} />
      ) : npcCardViewModels.length === 0 ? (
        <NPCsEmptyState onCreateClick={handleAddClick} />
      ) : (
        <NPCGrid viewModels={npcCardViewModels} onCardClick={handleCardClick} />
      )}

      {/* Detail Slideover */}
      <NPCDetailSlideover
        npcId={selectedNPCId}
        isOpen={isSlideoverOpen}
        onClose={handleCloseSlideover}
        onEdit={handleEdit}
        viewModel={npcDetails}
        campaignId={campaignId}
        factions={factions}
        locations={locations}
        isLoading={detailsLoading}
        onFieldUpdate={handleFieldUpdate}
        onAddCombatStats={handleAddCombatStats}
        onUpdateCombatStats={(command) => {
          if (selectedNPCId) {
            upsertCombatStatsMutation.mutate({ npcId: selectedNPCId, command });
          }
        }}
        onRemoveCombatStats={handleRemoveCombatStats}
        onUpdateRelationship={(relationshipId, command) => {
          updateRelationshipMutation.mutate({ relationshipId, command });
        }}
        onDeleteRelationship={(relationshipId) => {
          deleteRelationshipMutation.mutate(relationshipId);
        }}
        onAddRelationship={() => setIsAddRelationshipOpen(true)}
        isUpdating={updateMutation.isPending || upsertCombatStatsMutation.isPending}
      />

      {/* Form Dialog */}
      <NPCFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingNPCId(null);
        }}
        onSubmit={handleFormSubmit}
        campaignId={campaignId}
        factions={factions}
        locations={locations}
        mode={editingNPCId ? 'edit' : 'create'}
        initialData={
          editingNPCId && npcDetails
            ? {
                name: npcDetails.npc.name,
                role: npcDetails.npc.role,
                faction_id: npcDetails.npc.faction_id,
                current_location_id: npcDetails.npc.current_location_id,
                status: npcDetails.npc.status as 'alive' | 'dead' | 'unknown',
                image_url: npcDetails.npc.image_url,
                biography_json: npcDetails.npc.biography_json,
                personality_json: npcDetails.npc.personality_json,
                addCombatStats: !!npcDetails.combatStats,
                combatStats: npcDetails.combatStats ? npcDetails.combatStats : undefined,
              }
            : undefined
        }
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Add Relationship Dialog */}
      {selectedNPCId && (
        <AddRelationshipDialog
          isOpen={isAddRelationshipOpen}
          onClose={() => setIsAddRelationshipOpen(false)}
          onSubmit={(command) => {
            createRelationshipMutation.mutate(command);
            setIsAddRelationshipOpen(false);
          }}
          currentNpcId={selectedNPCId}
          availableNPCs={npcs || []}
          isSubmitting={createRelationshipMutation.isPending}
        />
      )}
    </div>
  );
}
