'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useCharacterCardsQuery,
  useCharacterDetailsQuery,
  useCreateCharacterMutation,
  useUpdateCharacterMutation,
  useDeleteCharacterMutation,
  useAddCombatStatsMutation,
  useUpdateCombatStatsMutation,
  useRemoveCombatStatsMutation,
  useCreatePCNPCRelationshipMutation,
  useUpdatePCNPCRelationshipMutation,
  useDeletePCNPCRelationshipMutation,
} from '@/hooks/useCharacters';
import { useFactionsQuery } from '@/hooks/useFactions';
import { useNPCsQuery } from '@/hooks/useNpcs';
import { CharactersHeader } from './CharactersHeader';
import { CharactersLayout } from './CharactersLayout';
import { CharacterFormDialog } from './forms/CharacterFormDialog';
import { AddPCNPCRelationshipDialog } from './forms/AddPCNPCRelationshipDialog';
import type { PlayerCharacterFilters, PlayerCharacterStatus } from '@/types/player-characters';
import type { JSONContent } from '@tiptap/core';
import type { ActionDTO } from '@/types';
import type { CharacterFormData } from '@/lib/schemas/player-character.schema';

interface CharactersViewProps {
  campaignId: string;
  campaignName: string;
}

/**
 * Main view component for managing player characters
 * Master-detail layout: 30% list | 70% detail panel
 */
export function CharactersView({ campaignId, campaignName }: CharactersViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Local state
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    searchParams.get('selectedId') || null
  );
  const [filters, setFilters] = useState<PlayerCharacterFilters>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddRelationshipOpen, setIsAddRelationshipOpen] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<{
    class: string | null;
    level: number | null;
    race: string | null;
    background: string | null;
    alignment: 'LG' | 'NG' | 'CG' | 'LN' | 'N' | 'CN' | 'LE' | 'NE' | 'CE' | null;
    age: number | null;
    languages: string[] | null;
    faction_id: string | null;
    image_url: string | null;
    biography_json: JSONContent | null;
    personality_json: JSONContent | null;
    notes: JSONContent | null;
    status: PlayerCharacterStatus;
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
  const { data: characters = [], isLoading: charactersLoading } = useCharacterCardsQuery(campaignId, filters);
  const { data: characterDetails, isLoading: detailsLoading } = useCharacterDetailsQuery(selectedCharacterId);
  const { data: factions = [] } = useFactionsQuery(campaignId);
  const { data: npcs = [] } = useNPCsQuery(campaignId);

  // Mutations
  const createMutation = useCreateCharacterMutation(campaignId);
  const updateMutation = useUpdateCharacterMutation(campaignId);
  const deleteMutation = useDeleteCharacterMutation(campaignId);
  const addCombatStatsMutation = useAddCombatStatsMutation();
  const updateCombatStatsMutation = useUpdateCombatStatsMutation();
  const removeCombatStatsMutation = useRemoveCombatStatsMutation();
  const createRelationshipMutation = useCreatePCNPCRelationshipMutation();
  const updateRelationshipMutation = useUpdatePCNPCRelationshipMutation(selectedCharacterId || '');
  const deleteRelationshipMutation = useDeletePCNPCRelationshipMutation(selectedCharacterId || '');

  // Handlers
  const handleCardClick = (characterId: string) => {
    setSelectedCharacterId(characterId);
    router.push(`/campaigns/${campaignId}/characters?selectedId=${characterId}`, { scroll: false });
  };

  const handleEdit = () => {
    if (characterDetails) {
      setEditedData({
        class: characterDetails.class,
        level: characterDetails.level,
        race: characterDetails.race,
        background: characterDetails.background,
        alignment: characterDetails.alignment,
        age: characterDetails.age,
        languages: characterDetails.languages,
        faction_id: characterDetails.faction_id,
        image_url: characterDetails.image_url,
        biography_json: characterDetails.biography_json,
        personality_json: characterDetails.personality_json,
        notes: characterDetails.notes,
        status: characterDetails.status,
        combatStats: characterDetails.combat_stats ? {
          hp_max: characterDetails.combat_stats.hp_max,
          armor_class: characterDetails.combat_stats.armor_class,
          speed: characterDetails.combat_stats.speed,
          strength: characterDetails.combat_stats.strength,
          dexterity: characterDetails.combat_stats.dexterity,
          constitution: characterDetails.combat_stats.constitution,
          intelligence: characterDetails.combat_stats.intelligence,
          wisdom: characterDetails.combat_stats.wisdom,
          charisma: characterDetails.combat_stats.charisma,
          actions_json: characterDetails.combat_stats.actions_json,
        } : null,
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (selectedCharacterId && editedData && characterDetails) {
      const changes: Record<string, unknown> = {};

      // Compare fields
      if (editedData.class !== characterDetails.class) changes.class = editedData.class;
      if (editedData.level !== characterDetails.level) changes.level = editedData.level;
      if (editedData.race !== characterDetails.race) changes.race = editedData.race;
      if (editedData.background !== characterDetails.background) changes.background = editedData.background;
      if (editedData.alignment !== characterDetails.alignment) changes.alignment = editedData.alignment;
      if (editedData.age !== characterDetails.age) changes.age = editedData.age;
      if (JSON.stringify(editedData.languages) !== JSON.stringify(characterDetails.languages)) changes.languages = editedData.languages;
      if (editedData.faction_id !== characterDetails.faction_id) changes.faction_id = editedData.faction_id;
      if (editedData.image_url !== characterDetails.image_url) changes.image_url = editedData.image_url;
      if (JSON.stringify(editedData.biography_json) !== JSON.stringify(characterDetails.biography_json)) changes.biography_json = editedData.biography_json;
      if (JSON.stringify(editedData.personality_json) !== JSON.stringify(characterDetails.personality_json)) changes.personality_json = editedData.personality_json;
      if (editedData.notes !== characterDetails.notes) changes.notes = editedData.notes;
      if (editedData.status !== characterDetails.status) changes.status = editedData.status;

      // Update character
      if (Object.keys(changes).length > 0) {
        updateMutation.mutate({ characterId: selectedCharacterId, command: changes });
      }

      // Handle combat stats
      if (editedData.combatStats && characterDetails.combat_stats) {
        const hasChanges =
          editedData.combatStats.hp_max !== characterDetails.combat_stats.hp_max ||
          editedData.combatStats.armor_class !== characterDetails.combat_stats.armor_class ||
          editedData.combatStats.speed !== characterDetails.combat_stats.speed ||
          editedData.combatStats.strength !== characterDetails.combat_stats.strength ||
          editedData.combatStats.dexterity !== characterDetails.combat_stats.dexterity ||
          editedData.combatStats.constitution !== characterDetails.combat_stats.constitution ||
          editedData.combatStats.intelligence !== characterDetails.combat_stats.intelligence ||
          editedData.combatStats.wisdom !== characterDetails.combat_stats.wisdom ||
          editedData.combatStats.charisma !== characterDetails.combat_stats.charisma ||
          JSON.stringify(editedData.combatStats.actions_json) !== JSON.stringify(characterDetails.combat_stats.actions_json);

        if (hasChanges) {
          updateCombatStatsMutation.mutate({ characterId: selectedCharacterId, command: editedData.combatStats });
        }
      } else if (editedData.combatStats && !characterDetails.combat_stats) {
        addCombatStatsMutation.mutate({ characterId: selectedCharacterId, command: editedData.combatStats });
      } else if (!editedData.combatStats && characterDetails.combat_stats) {
        removeCombatStatsMutation.mutate(selectedCharacterId);
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
    if (!selectedCharacterId || !characterDetails) return;

    if (!isEditing) {
      setEditedData({
        class: characterDetails.class,
        level: characterDetails.level,
        race: characterDetails.race,
        background: characterDetails.background,
        alignment: characterDetails.alignment,
        age: characterDetails.age,
        languages: characterDetails.languages,
        faction_id: characterDetails.faction_id,
        image_url: characterDetails.image_url,
        biography_json: characterDetails.biography_json,
        personality_json: characterDetails.personality_json,
        notes: characterDetails.notes,
        status: characterDetails.status,
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
    if (!selectedCharacterId) return;

    if (isEditing && editedData) {
      setEditedData({ ...editedData, combatStats: null });
    } else {
      removeCombatStatsMutation.mutate(selectedCharacterId);
    }
  };

  const handleDelete = () => {
    if (selectedCharacterId) {
      const deletedId = selectedCharacterId;
      setSelectedCharacterId(null);
      router.push(`/campaigns/${campaignId}/characters`, { scroll: false });
      deleteMutation.mutate(deletedId);
    }
  };

  // Reset edit mode when selection changes
  useEffect(() => {
    if (isEditing) {
      setIsEditing(false);
      setEditedData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCharacterId]);

  const handleAddClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateCharacter = async (data: CharacterFormData) => {
    const result = await createMutation.mutateAsync({
      name: data.name,
      class: data.class,
      level: data.level,
      race: data.race,
      status: data.status,
    });
    if (result) {
      setIsCreateDialogOpen(false);
      setSelectedCharacterId(result.id);
      router.push(`/campaigns/${campaignId}/characters?selectedId=${result.id}`, { scroll: false });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <CharactersHeader
        campaignName={campaignName}
        campaignId={campaignId}
        onAddClick={handleAddClick}
      />

      {/* Layout: List + Detail Panel */}
      <CharactersLayout
        characters={characters}
        selectedCharacterId={selectedCharacterId}
        onCharacterSelect={handleCardClick}
        campaignId={campaignId}
        factions={factions}
        availableNPCs={npcs}
        filters={filters}
        onFiltersChange={setFilters}
        isLoading={charactersLoading}
        detailViewModel={characterDetails}
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
        isUpdating={updateMutation.isPending || updateCombatStatsMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />

      {/* Dialogs */}
      <CharacterFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateCharacter}
        mode="create"
        isSubmitting={createMutation.isPending}
      />

      {selectedCharacterId && (
        <AddPCNPCRelationshipDialog
          isOpen={isAddRelationshipOpen}
          onClose={() => setIsAddRelationshipOpen(false)}
          onSubmit={(command) => {
            createRelationshipMutation.mutate({ characterId: selectedCharacterId, command });
            setIsAddRelationshipOpen(false);
          }}
          availableNPCs={npcs.map(npc => ({ id: npc.id, name: npc.name }))}
          isSubmitting={createRelationshipMutation.isPending}
        />
      )}
    </div>
  );
}
