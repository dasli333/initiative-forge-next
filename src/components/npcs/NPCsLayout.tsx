'use client';

import { SplitLayout } from '@/components/shared/SplitLayout';
import { NPCsList } from './NPCsList';
import { NPCDetailPanel } from './NPCDetailPanel';
import type { NPCCardViewModel, NPCDetailsViewModel, NPCFilters } from '@/types/npcs';
import type { NPCTagDTO } from '@/types/npc-tags';
import type { UpdateNPCRelationshipCommand } from '@/types/npc-relationships';
import type { JSONContent } from '@tiptap/core';
import type { ActionDTO } from '@/types';

interface NPCsLayoutProps {
  npcs: NPCCardViewModel[];
  selectedNPCId: string | null;
  onNPCSelect: (npcId: string) => void;
  campaignId: string;
  factions: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  tags: NPCTagDTO[];
  filters: NPCFilters;
  onFiltersChange: (filters: NPCFilters) => void;
  isLoading: boolean;
  // Detail panel props
  detailViewModel: NPCDetailsViewModel | undefined;
  isDetailLoading: boolean;
  isEditing: boolean;
  editedData: {
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
    secrets: string | null;
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
  onUpdateRelationship: (relationshipId: string, command: UpdateNPCRelationshipCommand) => void;
  onDeleteRelationship: (relationshipId: string) => void;
  onAddRelationship: () => void;
  onAssignTag: (tagId: string) => Promise<void>;
  onUnassignTag: (tagId: string) => Promise<void>;
  onCreateTag: (name: string, color: string, icon: string) => Promise<NPCTagDTO>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

/**
 * Main layout container for NPCs view
 * 30% list (left) | 70% detail panel (right)
 * Similar pattern to LocationsLayout
 */
export function NPCsLayout({
  npcs,
  selectedNPCId,
  onNPCSelect,
  campaignId,
  factions,
  locations,
  tags,
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
  onAssignTag,
  onUnassignTag,
  onCreateTag,
  isUpdating = false,
  isDeleting = false,
}: NPCsLayoutProps) {
  return (
    <SplitLayout
      leftPanel={
        <NPCsList
          npcs={npcs}
          selectedNPCId={selectedNPCId}
          onNPCSelect={onNPCSelect}
          factions={factions}
          locations={locations}
          tags={tags}
          filters={filters}
          onFiltersChange={onFiltersChange}
          isLoading={isLoading}
        />
      }
      rightPanel={
        <NPCDetailPanel
          npcId={selectedNPCId}
          viewModel={detailViewModel}
          campaignId={campaignId}
          factions={factions}
          locations={locations}
          availableTags={tags}
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
          onAssignTag={onAssignTag}
          onUnassignTag={onUnassignTag}
          onCreateTag={onCreateTag}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      }
    />
  );
}
