'use client';

import { SplitLayout } from '@/components/shared/SplitLayout';
import { FactionsList } from './FactionsList';
import { FactionDetailPanel } from './FactionDetailPanel';
import type { FactionCardViewModel, FactionDetailsViewModel, FactionRelationshipViewModel } from '@/types/factions';
import type { JSONContent } from '@tiptap/core';

interface FactionsLayoutProps {
  factions: FactionCardViewModel[];
  selectedFactionId: string | null;
  onFactionSelect: (factionId: string) => void;
  campaignId: string;
  isLoading: boolean;
  // Detail panel props
  detailViewModel: FactionDetailsViewModel | undefined;
  isDetailLoading: boolean;
  isEditing: boolean;
  editedData: {
    name: string;
    description_json: JSONContent | null;
    goals_json: JSONContent | null;
    image_url: string | null;
  } | null;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditedDataChange: (field: string, value: unknown) => void;
  onAddRelationship: () => void;
  onEditRelationship: (rel: FactionRelationshipViewModel) => void;
  onDeleteRelationship: (id: string) => void;
  onAssignMembers: () => void;
  onUnassignMember: (npcId: string) => void;
  isUpdating?: boolean;
}

/**
 * Main layout container for Factions view
 * 30% list (left) | 70% detail panel (right)
 * Similar pattern to NPCsLayout
 */
export function FactionsLayout({
  factions,
  selectedFactionId,
  onFactionSelect,
  campaignId,
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
  onAddRelationship,
  onEditRelationship,
  onDeleteRelationship,
  onAssignMembers,
  onUnassignMember,
  isUpdating = false,
}: FactionsLayoutProps) {
  return (
    <SplitLayout
      leftPanel={
        <FactionsList
          factions={factions}
          selectedFactionId={selectedFactionId}
          onFactionSelect={onFactionSelect}
          isLoading={isLoading}
        />
      }
      rightPanel={
        <FactionDetailPanel
          factionId={selectedFactionId}
          viewModel={detailViewModel}
          campaignId={campaignId}
          isLoading={isDetailLoading}
          isEditing={isEditing}
          editedData={editedData}
          onEdit={onEdit}
          onSave={onSave}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
          onEditedDataChange={onEditedDataChange}
          onAddRelationship={onAddRelationship}
          onEditRelationship={onEditRelationship}
          onDeleteRelationship={onDeleteRelationship}
          onAssignMembers={onAssignMembers}
          onUnassignMember={onUnassignMember}
          isUpdating={isUpdating}
        />
      }
    />
  );
}
