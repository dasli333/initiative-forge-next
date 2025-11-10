'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pencil, Save, X, Users, Trash2 } from 'lucide-react';
import { StoryTab } from './tabs/StoryTab';
import { CombatTab } from './tabs/CombatTab';
import { RelationshipsTab } from './tabs/RelationshipsTab';
import { RelatedTab } from './tabs/RelatedTab';
import { NPCCharacterCard } from './shared/NPCCharacterCard';
import { cn } from '@/lib/utils';
import type { NPCDetailsViewModel } from '@/types/npcs';
import type { UpdateNPCRelationshipCommand } from '@/types/npc-relationships';
import type { NPCTagDTO } from '@/types/npc-tags';
import type { JSONContent } from '@tiptap/core';
import type { ActionDTO } from '@/types';

interface NPCDetailPanelProps {
  npcId: string | null;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  viewModel: NPCDetailsViewModel | undefined;
  campaignId: string;
  factions: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  availableTags: NPCTagDTO[];
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
  } | null;
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
 * Right panel for NPC details
 * - Header: Edit/Save/Cancel/Delete buttons
 * - Character Card: Always visible (name, tags, avatar, stats)
 * - Tabs: Story | Combat | Relationships
 * - Renders: NPCCharacterCard, StoryTab, CombatTab, RelationshipsTab
 */
export function NPCDetailPanel({
  npcId,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  viewModel,
  campaignId,
  factions,
  locations,
  availableTags,
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
  onAssignTag,
  onUnassignTag,
  onCreateTag,
  isUpdating = false,
  isDeleting = false,
}: NPCDetailPanelProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

  const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' => {
    if (status === 'alive') return 'default';
    if (status === 'dead') return 'destructive';
    return 'secondary';
  };

  return (
    <div className={cn(
      "flex flex-col h-full transition-all",
      isEditing && "border-2 border-primary/30 rounded-lg m-1"
    )}>
      {/* Header - Name, Tags, Edit/Save/Cancel */}
      <div className={cn(
        "px-6 py-4",
        isEditing && "bg-primary/5"
      )}>
        <div className="flex items-start justify-between gap-4">
          {/* Left: Name + Tags */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{npc.name}</h2>
              <Badge variant={getStatusBadgeVariant(npc.status)}>
                {npc.status.charAt(0).toUpperCase() + npc.status.slice(1)}
              </Badge>
            </div>
            <NPCCharacterCard
              npc={npc}
              campaignId={campaignId}
              factionName={factionName}
              locationName={locationName}
              factions={factions}
              locations={locations}
              assignedTags={tags || []}
              availableTags={availableTags}
              onAssignTag={onAssignTag}
              onUnassignTag={onUnassignTag}
              onCreateTag={onCreateTag}
              isEditing={isEditing}
              editedData={editedData}
              onEditedDataChange={onEditedDataChange}
              isUpdating={isUpdating}
              showNameInCard={false}
            />
          </div>

          {/* Right: Action buttons */}
          <div className="flex gap-2 flex-shrink-0">
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
              <>
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete NPC</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{npc.name}</strong>?
              {relationships.length > 0 && (
                <span className="block mt-2 text-destructive">
                  This will also remove {relationships.length} relationship{relationships.length > 1 ? 's' : ''}.
                </span>
              )}
              <span className="block mt-2">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteDialog(false);
                onDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="story" className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="story">Story</TabsTrigger>
              <TabsTrigger value="combat">Combat</TabsTrigger>
              <TabsTrigger value="relationships">Relationships</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="story" className="mt-0 h-full">
              <StoryTab
                npc={npc}
                campaignId={campaignId}
                isEditing={isEditing}
                editedData={editedData}
                onEditedDataChange={onEditedDataChange}
                isUpdating={isUpdating}
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

            <TabsContent value="related" className="mt-0 h-full">
              <RelatedTab
                backlinks={backlinks}
                pcRelationships={viewModel?.pcRelationships}
                campaignId={campaignId}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
