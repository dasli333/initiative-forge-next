'use client';

import { SplitLayout } from '@/components/shared/SplitLayout';
import { CharactersList } from './CharactersList';
import { CharacterDetailPanel } from './CharacterDetailPanel';
import type {
  PlayerCharacterCardViewModel,
  PlayerCharacterDetailsViewModel,
  PlayerCharacterFilters,
  UpdatePCNPCRelationshipCommand,
  PlayerCharacterStatus,
} from '@/types/player-characters';
import type { JSONContent } from '@tiptap/core';
import type { ActionDTO } from '@/types';

interface CharactersLayoutProps {
  characters: PlayerCharacterCardViewModel[];
  selectedCharacterId: string | null;
  onCharacterSelect: (characterId: string) => void;
  campaignId: string;
  factions: Array<{ id: string; name: string }>;
  availableNPCs: Array<{ id: string; name: string }>;
  filters: PlayerCharacterFilters;
  onFiltersChange: (filters: PlayerCharacterFilters) => void;
  isLoading: boolean;
  // Detail panel props
  detailViewModel: PlayerCharacterDetailsViewModel | undefined;
  isDetailLoading: boolean;
  isEditing: boolean;
  editedData: {
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
  } | null;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditedDataChange: (field: string, value: unknown) => void;
  onCombatStatsChange: (field: string, value: unknown) => void;
  onAddCombatStats: () => void;
  onRemoveCombatStats: () => void;
  onUpdateRelationship: (relationshipId: string, command: UpdatePCNPCRelationshipCommand) => void;
  onDeleteRelationship: (relationshipId: string) => void;
  onAddRelationship: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

/**
 * Main layout container for Player Characters view
 * 30% list (left) | 70% detail panel (right)
 * Similar pattern to NPCsLayout but simpler (no tags)
 */
export function CharactersLayout({
  characters,
  selectedCharacterId,
  onCharacterSelect,
  campaignId,
  factions,
  availableNPCs,
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
  onCombatStatsChange,
  onAddCombatStats,
  onRemoveCombatStats,
  onUpdateRelationship,
  onDeleteRelationship,
  onAddRelationship,
  isUpdating = false,
  isDeleting = false,
}: CharactersLayoutProps) {
  return (
    <SplitLayout
      leftPanel={
        <CharactersList
          characters={characters}
          selectedCharacterId={selectedCharacterId}
          onCharacterSelect={onCharacterSelect}
          factions={factions}
          filters={filters}
          onFiltersChange={onFiltersChange}
          isLoading={isLoading}
        />
      }
      rightPanel={
        <CharacterDetailPanel
          characterId={selectedCharacterId}
          viewModel={detailViewModel}
          campaignId={campaignId}
          factions={factions}
          availableNPCs={availableNPCs}
          isLoading={isDetailLoading}
          isEditing={isEditing}
          editedData={editedData}
          onEdit={onEdit}
          onSave={onSave}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
          onEditedDataChange={onEditedDataChange}
          onCombatStatsChange={onCombatStatsChange}
          onAddCombatStats={onAddCombatStats}
          onRemoveCombatStats={onRemoveCombatStats}
          onUpdateRelationship={onUpdateRelationship}
          onDeleteRelationship={onDeleteRelationship}
          onAddRelationship={onAddRelationship}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      }
    />
  );
}
