'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { NPCsHeader } from '@/components/npcs/NPCsHeader';
import { NPCsLayout } from '@/components/npcs/NPCsLayout';
import { NPCFormDialog } from '@/components/npcs/forms/NPCFormDialog';
import { AddRelationshipDialog } from '@/components/npcs/forms/AddRelationshipDialog';
import { TagManager } from '@/components/npcs/TagManager';
import { useCampaignStore } from '@/stores/campaignStore';
import {
  useNPCsQuery,
  useNPCDetailsQuery,
  useCreateNPCMutation,
  useUpdateNPCMutation,
  useDeleteNPCMutation,
  useUpsertNPCCombatStatsMutation,
  useDeleteNPCCombatStatsMutation,
  useCreateNPCRelationshipMutation,
  useUpdateNPCRelationshipMutation,
  useDeleteNPCRelationshipMutation,
} from '@/hooks/useNpcs';
import {
  useNPCTagsQuery,
  useCreateNPCTagMutation,
  useUpdateNPCTagMutation,
  useDeleteNPCTagMutation,
  useBulkAssignTagsToNPCMutation,
  useAssignTagToNPCMutation,
  useUnassignTagFromNPCMutation,
} from '@/hooks/useNpcTags';
import { useFactionsQuery } from '@/hooks/useFactions';
import { useLocationsQuery } from '@/hooks/useLocations';
import type { NPCCardViewModel, NPCFilters } from '@/types/npcs';
import type { NPCFormData } from '@/lib/schemas/npcs';
import type { JSONContent } from '@tiptap/core';
import type { ActionDTO } from '@/types';
import {TagIcon} from "@/types/npc-tags";

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
  const [selectedNPCId, setSelectedNPCId] = useState<string | null>(
    searchParams.get('selectedId') || null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddRelationshipOpen, setIsAddRelationshipOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [editingNPCId, setEditingNPCId] = useState<string | null>(null);
  const [filters, setFilters] = useState<NPCFilters>({});

  // Edit mode state for slideover
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<{
    role: string;
    faction_id: string | null;
    current_location_id: string | null;
    status: 'alive' | 'dead' | 'unknown';
    image_url: string | null;
    biography_json: JSONContent | null;
    personality_json: JSONContent | null;
    race: string | null;
    age: number | null;
    alignment: 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null;
    languages: string[] | null;
    distinguishing_features: string | null;
    secrets: JSONContent | null;
    combatStats: {
      hp_max: number;
      armor_class: number;
      speed: number;
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
      actions_json: ActionDTO[] | null;
    } | null;
  } | null>(null);

  // Queries
  const { data: npcs, isLoading: npcsLoading } = useNPCsQuery(campaignId, filters);
  const { data: npcDetails, isLoading: detailsLoading } = useNPCDetailsQuery(selectedNPCId);
  const { data: tags = [] } = useNPCTagsQuery(campaignId);
  const { data: factions = [] } = useFactionsQuery(campaignId);
  const { data: locations = [] } = useLocationsQuery(campaignId);

  // Mutations
  const createMutation = useCreateNPCMutation(campaignId);
  const updateMutation = useUpdateNPCMutation(campaignId);
  const deleteMutation = useDeleteNPCMutation(campaignId);
  const upsertCombatStatsMutation = useUpsertNPCCombatStatsMutation();
  const deleteCombatStatsMutation = useDeleteNPCCombatStatsMutation();
  const createRelationshipMutation = useCreateNPCRelationshipMutation();
  const updateRelationshipMutation = useUpdateNPCRelationshipMutation();
  const deleteRelationshipMutation = useDeleteNPCRelationshipMutation();
  const createTagMutation = useCreateNPCTagMutation(campaignId);
  const updateTagMutation = useUpdateNPCTagMutation();
  const deleteTagMutation = useDeleteNPCTagMutation(campaignId);
  const bulkAssignTagsMutation = useBulkAssignTagsToNPCMutation();
  const assignTagMutation = useAssignTagToNPCMutation();
  const unassignTagMutation = useUnassignTagFromNPCMutation();

  // Handlers
  const handleCardClick = (npcId: string) => {
    setSelectedNPCId(npcId);
    router.push(`/campaigns/${campaignId}/npcs?selectedId=${npcId}`, { scroll: false });
  };

  const handleEdit = () => {
    if (npcDetails) {
      setEditedData({
        role: npcDetails.npc.role || '',
        faction_id: npcDetails.npc.faction_id,
        current_location_id: npcDetails.npc.current_location_id,
        status: npcDetails.npc.status as 'alive' | 'dead' | 'unknown',
        image_url: npcDetails.npc.image_url,
        biography_json: npcDetails.npc.biography_json,
        personality_json: npcDetails.npc.personality_json,
        race: npcDetails.npc.race || null,
        age: npcDetails.npc.age || null,
        alignment: npcDetails.npc.alignment as 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null,
        languages: npcDetails.npc.languages || null,
        distinguishing_features: npcDetails.npc.distinguishing_features || null,
        secrets: npcDetails.npc.secrets || null,
        combatStats: npcDetails.combatStats ? {
          hp_max: npcDetails.combatStats.hp_max,
          armor_class: npcDetails.combatStats.armor_class,
          speed: npcDetails.combatStats.speed,
          strength: npcDetails.combatStats.strength,
          dexterity: npcDetails.combatStats.dexterity,
          constitution: npcDetails.combatStats.constitution,
          intelligence: npcDetails.combatStats.intelligence,
          wisdom: npcDetails.combatStats.wisdom,
          charisma: npcDetails.combatStats.charisma,
          actions_json: npcDetails.combatStats.actions_json,
        } : null,
      });
      setIsEditing(true);
    }
  };


  const handleSave = () => {
    if (selectedNPCId && editedData && npcDetails) {
      const changes: Record<string, unknown> = {};

      // Compare each field with original
      if (editedData.role !== (npcDetails.npc.role || '')) {
        changes.role = editedData.role || null;
      }
      if (editedData.faction_id !== npcDetails.npc.faction_id) {
        changes.faction_id = editedData.faction_id;
      }
      if (editedData.current_location_id !== npcDetails.npc.current_location_id) {
        changes.current_location_id = editedData.current_location_id;
      }
      if (editedData.status !== npcDetails.npc.status) {
        changes.status = editedData.status;
      }
      if (editedData.image_url !== npcDetails.npc.image_url) {
        changes.image_url = editedData.image_url;
      }
      if (JSON.stringify(editedData.biography_json) !== JSON.stringify(npcDetails.npc.biography_json)) {
        changes.biography_json = editedData.biography_json;
      }
      if (JSON.stringify(editedData.personality_json) !== JSON.stringify(npcDetails.npc.personality_json)) {
        changes.personality_json = editedData.personality_json;
      }
      // Character sheet fields
      if (editedData.race !== npcDetails.npc.race) {
        changes.race = editedData.race;
      }
      if (editedData.age !== npcDetails.npc.age) {
        changes.age = editedData.age;
      }
      if (editedData.alignment !== npcDetails.npc.alignment) {
        changes.alignment = editedData.alignment;
      }
      if (JSON.stringify(editedData.languages) !== JSON.stringify(npcDetails.npc.languages)) {
        changes.languages = editedData.languages;
      }
      if (editedData.distinguishing_features !== npcDetails.npc.distinguishing_features) {
        changes.distinguishing_features = editedData.distinguishing_features;
      }
      if (editedData.secrets !== npcDetails.npc.secrets) {
        changes.secrets = editedData.secrets;
      }

      // Update NPC if there are story changes
      if (Object.keys(changes).length > 0) {
        updateMutation.mutate({
          id: selectedNPCId,
          command: changes,
        });
      }

      // Handle combat stats changes
      if (editedData.combatStats && npcDetails.combatStats) {
        // Check if any combat stat changed
        const hasChanges =
          editedData.combatStats.hp_max !== npcDetails.combatStats.hp_max ||
          editedData.combatStats.armor_class !== npcDetails.combatStats.armor_class ||
          editedData.combatStats.speed !== npcDetails.combatStats.speed ||
          editedData.combatStats.strength !== npcDetails.combatStats.strength ||
          editedData.combatStats.dexterity !== npcDetails.combatStats.dexterity ||
          editedData.combatStats.constitution !== npcDetails.combatStats.constitution ||
          editedData.combatStats.intelligence !== npcDetails.combatStats.intelligence ||
          editedData.combatStats.wisdom !== npcDetails.combatStats.wisdom ||
          editedData.combatStats.charisma !== npcDetails.combatStats.charisma ||
          JSON.stringify(editedData.combatStats.actions_json) !== JSON.stringify(npcDetails.combatStats.actions_json);

        if (hasChanges) {
          upsertCombatStatsMutation.mutate({
            npcId: selectedNPCId,
            command: editedData.combatStats,
          });
        }
      } else if (editedData.combatStats && !npcDetails.combatStats) {
        // Create combat stats
        upsertCombatStatsMutation.mutate({
          npcId: selectedNPCId,
          command: editedData.combatStats,
        });
      } else if (!editedData.combatStats && npcDetails.combatStats) {
        // Delete combat stats
        deleteCombatStatsMutation.mutate(selectedNPCId);
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

  const handleCombatStatsChange = (field: string, value: unknown) => {
    if (editedData && editedData.combatStats) {
      setEditedData({
        ...editedData,
        combatStats: { ...editedData.combatStats, [field]: value },
      });
    }
  };

  const handleAddCombatStats = () => {
    if (!selectedNPCId || !npcDetails) return;

    // Enter edit mode if not already editing
    if (!isEditing) {
      setEditedData({
        role: npcDetails.npc.role || '',
        faction_id: npcDetails.npc.faction_id,
        current_location_id: npcDetails.npc.current_location_id,
        status: npcDetails.npc.status as 'alive' | 'dead' | 'unknown',
        image_url: npcDetails.npc.image_url,
        biography_json: npcDetails.npc.biography_json,
        personality_json: npcDetails.npc.personality_json,
        race: npcDetails.npc.race || null,
        age: npcDetails.npc.age || null,
        alignment: npcDetails.npc.alignment as 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null,
        languages: npcDetails.npc.languages || null,
        distinguishing_features: npcDetails.npc.distinguishing_features || null,
        secrets: npcDetails.npc.secrets || null,
        combatStats: {
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
      setIsEditing(true);
    } else if (editedData) {
      setEditedData({
        ...editedData,
        combatStats: {
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
    if (!selectedNPCId) return;

    // If editing, update editedData; otherwise delete immediately
    if (isEditing && editedData) {
      setEditedData({
        ...editedData,
        combatStats: null,
      });
    } else {
      // Delete combat stats immediately without entering edit mode
      deleteCombatStatsMutation.mutate(selectedNPCId);
    }
  };

  const handleAddClick = () => {
    setEditingNPCId(null);
    setIsCreateDialogOpen(true);
  };

  const handleFormSubmit = async (data: NPCFormData) => {
    const { tag_ids, ...npcData } = data;

    if (editingNPCId) {
      // Update existing NPC
      updateMutation.mutate({
        id: editingNPCId,
        command: npcData,
      });

      // Update tags if provided
      if (tag_ids && tag_ids.length > 0) {
        await bulkAssignTagsMutation.mutateAsync({
          npcId: editingNPCId,
          tagIds: tag_ids,
        });
      }
    } else {
      // Create new NPC
      createMutation.mutate(
        npcData,
        {
          onSuccess: async (newNPC) => {
            // Assign tags if any
            if (tag_ids && tag_ids.length > 0) {
              await bulkAssignTagsMutation.mutateAsync({
                npcId: newNPC.id,
                tagIds: tag_ids,
              });
            }

            // Auto-select newly created NPC
            setSelectedNPCId(newNPC.id);
          },
        }
      );
    }
  };

  const handleAssignTag = async (tagId: string) => {
    if (!selectedNPCId) return;
    await assignTagMutation.mutateAsync({
      npc_id: selectedNPCId,
      tag_id: tagId,
    });
  };

  const handleUnassignTag = async (tagId: string) => {
    if (!selectedNPCId) return;
    await unassignTagMutation.mutateAsync({
      npc_id: selectedNPCId,
      tag_id: tagId,
    });
  };

  const handleCreateTag = async (name: string, color: string, icon: TagIcon) => {
    return await createTagMutation.mutateAsync({ name, color, icon });
  };

  const handleDelete = () => {
    if (selectedNPCId) {
      const deletedId = selectedNPCId;
      // Clear selection immediately to prevent 406 error
      setSelectedNPCId(null);
      router.push(`/campaigns/${campaignId}/npcs`, { scroll: false });

      deleteMutation.mutate(deletedId);
    }
  };

  // Reset edit mode when selected NPC changes
  useEffect(() => {
    if (isEditing) {
      setIsEditing(false);
      setEditedData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNPCId]);

  // Convert NPCs to card view models with tags
  const npcsWithTags: NPCCardViewModel[] = useMemo(() => {
    if (!npcs) return [];

    return npcs.map((npc) => {
      // Extract tags from JOIN result
      const npcTags = (npc as import('@/types/npcs').NPCWithJoins).npc_tag_assignments?.map((assignment) => assignment.npc_tags).filter(Boolean) || [];

      return {
        npc,
        hasCombatStats: !!(npc as import('@/types/npcs').NPCWithJoins).npc_combat_stats, // Check if combat stats exist
        factionName: (npc as import('@/types/npcs').NPCWithJoins).factions?.name,
        locationName: (npc as import('@/types/npcs').NPCWithJoins).locations?.name,
        tags: npcTags,
      };
    });
  }, [npcs]);

  if (!selectedCampaign) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading campaign...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <NPCsHeader
        campaignName={selectedCampaign.name}
        campaignId={campaignId}
        onAddClick={handleAddClick}
        onManageTagsClick={() => setIsTagManagerOpen(true)}
      />

      {/* Layout: List + Detail Panel */}
      <NPCsLayout
        npcs={npcsWithTags}
        selectedNPCId={selectedNPCId}
        onNPCSelect={handleCardClick}
        campaignId={campaignId}
        factions={factions}
        locations={locations}
        tags={tags}
        filters={filters}
        onFiltersChange={setFilters}
        isLoading={npcsLoading}
        detailViewModel={npcDetails}
        isDetailLoading={detailsLoading}
        isEditing={isEditing}
        editedData={editedData}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancelEdit={handleCancelEdit}
        onDelete={handleDelete}
        onEditedDataChange={handleEditedDataChange}
        onCombatStatsChange={handleCombatStatsChange}
        onAddCombatStats={handleAddCombatStats}
        onRemoveCombatStats={handleRemoveCombatStats}
        onUpdateRelationship={(relationshipId, command) => {
          updateRelationshipMutation.mutate({ relationshipId, command });
        }}
        onDeleteRelationship={(relationshipId) => {
          deleteRelationshipMutation.mutate(relationshipId);
        }}
        onAddRelationship={() => setIsAddRelationshipOpen(true)}
        onAssignTag={handleAssignTag}
        onUnassignTag={handleUnassignTag}
        onCreateTag={handleCreateTag}
        isUpdating={updateMutation.isPending || upsertCombatStatsMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />

      {/* Tag Manager Dialog */}
      <TagManager
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
        tags={tags}
        onCreateTag={async (data) => {
          await createTagMutation.mutateAsync(data);
        }}
        onUpdateTag={async (tagId, data) => {
          await updateTagMutation.mutateAsync({ tagId, command: data });
        }}
        onDeleteTag={async (tagId) => {
          await deleteTagMutation.mutateAsync(tagId);
        }}
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
        tags={tags}
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
                tag_ids: npcDetails.tags?.map((tag) => tag.id) || [],
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
