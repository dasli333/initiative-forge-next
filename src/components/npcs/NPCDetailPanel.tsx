'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Save, X, Users } from 'lucide-react';
import { StoryTab } from './tabs/StoryTab';
import { CombatTab } from './tabs/CombatTab';
import { RelationshipsTab } from './tabs/RelationshipsTab';
import { TagBadge } from './shared/TagBadge';
import type { NPCDetailsViewModel } from '@/types/npcs';
import type { UpdateNPCRelationshipCommand } from '@/types/npc-relationships';
import type { JSONContent } from '@tiptap/core';
import type { ActionDTO } from '@/types';

interface NPCDetailPanelProps {
  npcId: string | null;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  viewModel: NPCDetailsViewModel | undefined;
  campaignId: string;
  factions: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  isLoading: boolean;
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
 * Right panel for NPC details
 * - Header: NPC name, role, tags, Edit/Save/Cancel buttons
 * - Tabs: Story | Combat | Relationships
 * - Renders: StoryTab, CombatTab, RelationshipsTab
 */
export function NPCDetailPanel({
  npcId,
  onEdit,
  onSave,
  onCancelEdit,
  viewModel,
  campaignId,
  factions,
  locations,
  isLoading,
  isEditing,
  editedData,
  onEditedDataChange,
  onCombatStatsChange,
  onAddCombatStats,
  onRemoveCombatStats,
  onUpdateRelationship,
  onDeleteRelationship,
  onAddRelationship,
  isUpdating = false,
}: NPCDetailPanelProps) {
  // Empty state when no NPC selected
  if (!npcId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No NPC Selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select an NPC from the list to view details, or create a new one to get started.
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-6 space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // 404 - NPC not found
  if (!viewModel) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">NPC Not Found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          The selected NPC could not be found. It may have been deleted.
        </p>
      </div>
    );
  }

  const { npc, combatStats, relationships, backlinks, factionName, locationName, tags } = viewModel;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold truncate">{npc.name}</h2>
            {npc.role && (
              <p className="text-sm text-muted-foreground truncate">{npc.role}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancelEdit}
                  disabled={isUpdating}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={onSave} disabled={isUpdating}>
                  <Save className="w-4 h-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="sm" />
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="story" className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="story">Story</TabsTrigger>
              <TabsTrigger value="combat">Combat</TabsTrigger>
              <TabsTrigger value="relationships">Relationships</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="story" className="mt-0 h-full">
              <StoryTab
                npc={npc}
                factionName={factionName}
                locationName={locationName}
                backlinks={backlinks}
                factions={factions}
                locations={locations}
                campaignId={campaignId}
                isEditing={isEditing}
                editedData={editedData}
                onEditedDataChange={onEditedDataChange}
              />
            </TabsContent>

            <TabsContent value="combat" className="mt-0 h-full">
              <CombatTab
                npc={npc}
                combatStats={combatStats}
                campaignId={campaignId}
                isEditing={isEditing}
                editedCombatStats={editedData?.combatStats}
                onCombatStatsChange={onCombatStatsChange}
                onAddStats={onAddCombatStats}
                onRemoveStats={onRemoveCombatStats}
                isUpdating={isUpdating}
              />
            </TabsContent>

            <TabsContent value="relationships" className="mt-0 h-full">
              <RelationshipsTab
                npc={npc}
                relationships={relationships}
                onUpdateRelationship={onUpdateRelationship}
                onDeleteRelationship={onDeleteRelationship}
                onAddRelationship={onAddRelationship}
                isUpdating={isUpdating}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
