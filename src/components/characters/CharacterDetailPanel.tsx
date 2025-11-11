'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Pencil, Save, X, User, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StoryTab } from './tabs/StoryTab';
import { CombatTab } from './tabs/CombatTab';
import { RelationshipsTab } from './tabs/RelationshipsTab';
import { NotesTab } from './tabs/NotesTab';
import { RelatedTab } from './tabs/RelatedTab';
import { PCCharacterCard } from './shared/PCCharacterCard';
import { Badge } from '@/components/ui/badge';
import type {
  PlayerCharacterDetailsViewModel,
  UpdatePCNPCRelationshipCommand,
  PlayerCharacterStatus,
} from '@/types/player-characters';
import type { JSONContent } from '@tiptap/core';
import type { ActionDTO } from '@/types';

interface CharacterDetailPanelProps {
  characterId: string | null;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  viewModel: PlayerCharacterDetailsViewModel | undefined;
  campaignId: string;
  factions: Array<{ id: string; name: string }>;
  availableNPCs: Array<{ id: string; name: string }>;
  isLoading: boolean;
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
 * Right panel for player character details
 * - Header: Edit/Save/Cancel/Delete buttons
 * - Tabs: Story | Combat | Relationships | Notes | Related
 */
export function CharacterDetailPanel({
  characterId,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  viewModel,
  campaignId,
  factions,
  availableNPCs: _availableNPCs,
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
  isDeleting = false,
}: CharacterDetailPanelProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Empty state when no character selected
  if (!characterId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <User className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Character Selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a character from the list to view details, or create a new one to get started.
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

  // Not found state
  if (!viewModel) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <h3 className="text-lg font-medium text-destructive mb-2">Character Not Found</h3>
        <p className="text-sm text-muted-foreground">
          The selected character could not be loaded.
        </p>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' => {
    if (status === 'active') return 'default';
    if (status === 'deceased') return 'destructive';
    return 'secondary';
  };

  return (
    <div className={cn(
      "flex flex-col h-full transition-all",
      isEditing && "border-2 border-primary/30 rounded-lg m-1"
    )}>
      {/* Header - Name, Status Badge, Edit/Save/Cancel */}
      <div className={cn(
        "px-6 py-4",
        isEditing && "bg-primary/5"
      )}>
        <div className="flex items-start justify-between gap-4">
          {/* Left: Name + Status Badge */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{viewModel.name}</h2>
              <Badge variant={getStatusBadgeVariant(viewModel.status)}>
                {viewModel.status.charAt(0).toUpperCase() + viewModel.status.slice(1)}
              </Badge>
            </div>
            <PCCharacterCard
              viewModel={viewModel}
              campaignId={campaignId}
              factions={factions}
              isEditing={isEditing}
              editedData={editedData}
              onEditedDataChange={onEditedDataChange}
              isUpdating={isUpdating}
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

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="story" className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="story">Story</TabsTrigger>
              <TabsTrigger value="combat" data-testid="combat-tab-trigger">Combat</TabsTrigger>
              <TabsTrigger value="relationships">Relationships</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="story" className="mt-0 h-full">
              <StoryTab
                isEditing={isEditing}
                editedData={editedData}
                viewModel={viewModel}
                onFieldChange={onEditedDataChange}
                campaignId={campaignId}
                factions={factions}
              />
            </TabsContent>

            <TabsContent value="combat" className="mt-0 h-full">
              <CombatTab
                isEditing={isEditing}
                combatStats={viewModel.combat_stats}
                editedCombatStats={editedData?.combatStats || null}
                onCombatStatsChange={onCombatStatsChange}
                onAddCombatStats={onAddCombatStats}
                onRemoveCombatStats={onRemoveCombatStats}
              />
            </TabsContent>

            <TabsContent value="relationships" className="mt-0 h-full">
              <RelationshipsTab
                relationships={viewModel.relationships}
                isEditing={isEditing}
                onUpdateRelationship={onUpdateRelationship}
                onDeleteRelationship={onDeleteRelationship}
                onAddRelationship={onAddRelationship}
                isUpdating={isUpdating}
              />
            </TabsContent>

            <TabsContent value="notes" className="mt-0 h-full">
              <NotesTab
                isEditing={isEditing}
                notes={viewModel.notes}
                editedNotes={editedData?.notes || null}
                onNotesChange={(notes) => onEditedDataChange('notes', notes)}
                campaignId={campaignId}
              />
            </TabsContent>

            <TabsContent value="related" className="mt-0 h-full">
              <RelatedTab
                characterId={characterId}
                campaignId={campaignId}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Character</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{viewModel.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteDialog(false);
                onDelete();
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
