'use client';

import { useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { FactionsHeader } from '@/components/factions/FactionsHeader';
import { FactionsLayout } from '@/components/factions/FactionsLayout';
import { FactionFormDialog } from '@/components/factions/forms/FactionFormDialog';
import { AddRelationshipDialog } from '@/components/factions/forms/AddRelationshipDialog';
import { AssignNPCsDialog } from '@/components/factions/forms/AssignNPCsDialog';
import { useCampaignStore } from '@/stores/campaignStore';
import {
  useFactionsQuery,
  useFactionDetailsQuery,
  useCreateFactionMutation,
  useUpdateFactionMutation,
  useDeleteFactionMutation,
  useBulkUpdateNPCFactionsMutation,
} from '@/hooks/useFactions';
import {
  useCreateFactionRelationshipMutation,
  useUpdateFactionRelationshipMutation,
  useDeleteFactionRelationshipMutation,
} from '@/hooks/useFactionRelationships';
import { useNPCsQuery } from '@/hooks/useNpcs';
import type { FactionCardViewModel, FactionRelationshipViewModel } from '@/types/factions';
import type { JSONContent } from '@tiptap/core';

/**
 * Main Factions page
 * - Manages faction CRUD operations
 * - Manages faction relationships
 * - Manages NPC assignments
 */
export default function FactionsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = params.id as string;

  // Get campaign from store
  const { selectedCampaign } = useCampaignStore();

  // Derive selected faction from URL params (no effect needed)
  const selectedFactionId = searchParams.get('selectedId') || null;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddRelationshipOpen, setIsAddRelationshipOpen] = useState(false);
  const [isAssignNPCsOpen, setIsAssignNPCsOpen] = useState(false);
  const [editingFactionId, setEditingFactionId] = useState<string | null>(null);
  const [editingRelationship, setEditingRelationship] = useState<FactionRelationshipViewModel | null>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<{
    name: string;
    description_json: JSONContent | null;
    goals_json: JSONContent | null;
    image_url: string | null;
  } | null>(null);

  // Queries
  const { data: factions = [], isLoading: factionsLoading } = useFactionsQuery(campaignId);
  const { data: detailViewModel, isLoading: detailsLoading } = useFactionDetailsQuery(selectedFactionId);
  const { data: allNPCs = [] } = useNPCsQuery(campaignId, {});

  // Mutations
  const createMutation = useCreateFactionMutation(campaignId);
  const updateMutation = useUpdateFactionMutation(campaignId);
  const deleteMutation = useDeleteFactionMutation(campaignId);
  const createRelMutation = useCreateFactionRelationshipMutation();
  const updateRelMutation = useUpdateFactionRelationshipMutation();
  const deleteRelMutation = useDeleteFactionRelationshipMutation();
  const bulkAssignMutation = useBulkUpdateNPCFactionsMutation();

  // Build FactionCardViewModels client-side
  const factionCardViewModels: FactionCardViewModel[] = useMemo(() => {
    if (!factions) return [];

    return factions.map(faction => ({
      faction,
      memberCount: 0, // TODO: compute from NPCs or include in API
      relationshipCounts: {
        alliance: 0,
        war: 0,
        rivalry: 0,
        neutral: 0,
      },
    }));
  }, [factions]);

  // Handlers
  const handleCardClick = (factionId: string) => {
    router.push(`/campaigns/${campaignId}/factions?selectedId=${factionId}`, { scroll: false });
  };

  const handleEdit = () => {
    if (detailViewModel) {
      setEditedData({
        name: detailViewModel.faction.name,
        description_json: detailViewModel.faction.description_json,
        goals_json: detailViewModel.faction.goals_json,
        image_url: detailViewModel.faction.image_url,
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (selectedFactionId && editedData && detailViewModel) {
      const changes: Record<string, unknown> = {};

      // Compare each field with original
      if (editedData.name !== detailViewModel.faction.name) {
        changes.name = editedData.name;
      }
      if (JSON.stringify(editedData.description_json) !== JSON.stringify(detailViewModel.faction.description_json)) {
        changes.description_json = editedData.description_json;
      }
      if (JSON.stringify(editedData.goals_json) !== JSON.stringify(detailViewModel.faction.goals_json)) {
        changes.goals_json = editedData.goals_json;
      }
      if (editedData.image_url !== detailViewModel.faction.image_url) {
        changes.image_url = editedData.image_url;
      }

      // Update faction if there are changes
      if (Object.keys(changes).length > 0) {
        updateMutation.mutate({
          id: selectedFactionId,
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
    if (selectedFactionId) {
      deleteMutation.mutate(selectedFactionId, {
        onSuccess: () => {
          router.push(`/campaigns/${campaignId}/factions`, { scroll: false });
        },
      });
    }
  };

  const handleAddClick = () => {
    setEditingFactionId(null);
    setIsCreateDialogOpen(true);
  };

  const handleFormSubmit = (data: {
    name: string;
    description_json?: JSONContent | null;
    goals_json?: JSONContent | null;
    image_url?: string | null;
  }) => {
    if (editingFactionId) {
      // Update existing faction
      updateMutation.mutate({
        id: editingFactionId,
        command: data,
      });
    } else {
      // Create new faction
      createMutation.mutate(data, {
        onSuccess: (newFaction) => {
          // Auto-select newly created faction
          router.push(`/campaigns/${campaignId}/factions?selectedId=${newFaction.id}`, { scroll: false });
        },
      });
    }
  };

  const handleAddRelationship = () => {
    setEditingRelationship(null);
    setIsAddRelationshipOpen(true);
  };

  const handleEditRelationship = (rel: FactionRelationshipViewModel) => {
    setEditingRelationship(rel);
    setIsAddRelationshipOpen(true);
  };

  const handleRelationshipSubmit = (data: {
    faction_id_2: string;
    relationship_type: 'alliance' | 'war' | 'rivalry' | 'neutral';
    description?: string | null;
  }) => {
    if (!selectedFactionId) return;

    if (editingRelationship) {
      // Update existing relationship
      updateRelMutation.mutate({
        id: editingRelationship.id,
        command: {
          relationship_type: data.relationship_type,
          description: data.description || null,
        },
      });
    } else {
      // Create new relationship
      createRelMutation.mutate({
        faction_id_1: selectedFactionId,
        faction_id_2: data.faction_id_2,
        relationship_type: data.relationship_type,
        description: data.description || null,
      });
    }
  };

  const handleDeleteRelationship = (id: string) => {
    if (!detailViewModel) return;

    // Find the relationship to get faction IDs for invalidation
    const rel = detailViewModel.relationships.find(r => r.id === id);
    if (!rel) return;

    deleteRelMutation.mutate({
      id,
      faction_id_1: rel.faction_id_1,
      faction_id_2: rel.faction_id_2,
    });
  };

  const handleAssignMembers = () => {
    setIsAssignNPCsOpen(true);
  };

  const handleAssignNPCsSubmit = (npcIds: string[]) => {
    if (!selectedFactionId) return;

    bulkAssignMutation.mutate({
      npcIds,
      factionId: selectedFactionId,
    });
  };

  const handleUnassignMember = (npcId: string) => {
    bulkAssignMutation.mutate({
      npcIds: [npcId],
      factionId: null,
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <FactionsHeader
        campaignName={selectedCampaign?.name || 'Campaign'}
        campaignId={campaignId}
        onAddClick={handleAddClick}
      />

      <FactionsLayout
        factions={factionCardViewModels}
        selectedFactionId={selectedFactionId}
        onFactionSelect={handleCardClick}
        campaignId={campaignId}
        isLoading={factionsLoading}
        detailViewModel={detailViewModel}
        isDetailLoading={detailsLoading}
        isEditing={isEditing}
        editedData={editedData}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancelEdit={handleCancelEdit}
        onDelete={handleDelete}
        onEditedDataChange={handleEditedDataChange}
        onAddRelationship={handleAddRelationship}
        onEditRelationship={handleEditRelationship}
        onDeleteRelationship={handleDeleteRelationship}
        onAssignMembers={handleAssignMembers}
        onUnassignMember={handleUnassignMember}
        isUpdating={updateMutation.isPending || bulkAssignMutation.isPending}
      />

      {/* Dialogs */}
      <FactionFormDialog
        isOpen={isCreateDialogOpen || editingFactionId !== null}
        mode={editingFactionId ? 'edit' : 'create'}
        faction={editingFactionId ? factions.find(f => f.id === editingFactionId) : null}
        campaignId={campaignId}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingFactionId(null);
        }}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <AddRelationshipDialog
        isOpen={isAddRelationshipOpen}
        onClose={() => {
          setIsAddRelationshipOpen(false);
          setEditingRelationship(null);
        }}
        onSubmit={handleRelationshipSubmit}
        currentFactionId={selectedFactionId || ''}
        allFactions={factions}
        mode={editingRelationship ? 'edit' : 'create'}
        relationship={editingRelationship}
        isSubmitting={createRelMutation.isPending || updateRelMutation.isPending}
      />

      <AssignNPCsDialog
        isOpen={isAssignNPCsOpen}
        onClose={() => setIsAssignNPCsOpen(false)}
        onSubmit={handleAssignNPCsSubmit}
        factionId={selectedFactionId || ''}
        currentMembers={detailViewModel?.members || []}
        availableNPCs={allNPCs}
        isSubmitting={bulkAssignMutation.isPending}
      />
    </div>
  );
}
