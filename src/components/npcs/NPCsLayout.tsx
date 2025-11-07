'use client';

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
  onEditedDataChange: (field: string, value: unknown) => void;
  onCombatStatsChange: (field: string, value: unknown) => void;
  onAddCombatStats: () => void;
  onRemoveCombatStats: () => void;
  onUpdateRelationship: (relationshipId: string, command: UpdateNPCRelationshipCommand) => void;
  onDeleteRelationship: (relationshipId: string) => void;
  onAddRelationship: () => void;
  isUpdating?: boolean;
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
  onEditedDataChange,
  onCombatStatsChange,
  onAddCombatStats,
  onRemoveCombatStats,
  onUpdateRelationship,
  onDeleteRelationship,
  onAddRelationship,
  isUpdating = false,
}: NPCsLayoutProps) {
  return (
    <div className="flex-1 flex gap-6 overflow-hidden">
      {/* LEFT PANEL - NPC List (30%) */}
      <div className="w-[30%] border-r overflow-hidden">
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
      </div>

      {/* RIGHT PANEL - Detail Panel (70%) */}
      <div className="flex-1 overflow-hidden">
        <NPCDetailPanel
          npcId={selectedNPCId}
          viewModel={detailViewModel}
          campaignId={campaignId}
          factions={factions}
          locations={locations}
          isLoading={isDetailLoading}
          isEditing={isEditing}
          editedData={editedData}
          onEdit={onEdit}
          onSave={onSave}
          onCancelEdit={onCancelEdit}
          onEditedDataChange={onEditedDataChange}
          onCombatStatsChange={onCombatStatsChange}
          onAddCombatStats={onAddCombatStats}
          onRemoveCombatStats={onRemoveCombatStats}
          onUpdateRelationship={onUpdateRelationship}
          onDeleteRelationship={onDeleteRelationship}
          onAddRelationship={onAddRelationship}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  );
}
