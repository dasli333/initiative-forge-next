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
import type {
  PlayerCharacterDetailsViewModel,
  UpdatePCNPCRelationshipCommand,
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
    notes: string | null;
    status: 'active' | 'retired' | 'deceased';
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
  availableNPCs,
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          'p-4 border-b flex items-center justify-between',
          isEditing && 'bg-accent/20 border-l-4 border-l-primary'
        )}
      >
        <div>
          <h2 className="text-xl font-bold">{viewModel.name}</h2>
          <p className="text-sm text-muted-foreground">
            {[
              viewModel.level && `Level ${viewModel.level}`,
              viewModel.class,
            ]
              .filter(Boolean)
              .join(' ') || 'Player Character'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancelEdit}
                disabled={isUpdating}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSave}
                disabled={isUpdating}
              >
                <Save className="w-4 h-4 mr-1" />
                {isUpdating ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={onEdit}
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="story" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="story" className="rounded-none">
            Story
          </TabsTrigger>
          <TabsTrigger value="combat" className="rounded-none">
            Combat
          </TabsTrigger>
          <TabsTrigger value="relationships" className="rounded-none">
            Relationships
          </TabsTrigger>
          <TabsTrigger value="notes" className="rounded-none">
            Notes
          </TabsTrigger>
          <TabsTrigger value="related" className="rounded-none">
            Related
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="story" className="p-6 m-0">
            <StoryTab
              isEditing={isEditing}
              editedData={editedData}
              viewModel={viewModel}
              onFieldChange={onEditedDataChange}
              campaignId={campaignId}
              factions={factions}
            />
          </TabsContent>

          <TabsContent value="combat" className="p-6 m-0">
            <CombatTab
              isEditing={isEditing}
              combatStats={viewModel.combat_stats}
              editedCombatStats={editedData?.combatStats || null}
              onCombatStatsChange={onCombatStatsChange}
              onAddCombatStats={onAddCombatStats}
              onRemoveCombatStats={onRemoveCombatStats}
            />
          </TabsContent>

          <TabsContent value="relationships" className="p-6 m-0">
            <RelationshipsTab
              relationships={viewModel.relationships}
              isEditing={isEditing}
              onUpdateRelationship={onUpdateRelationship}
              onDeleteRelationship={onDeleteRelationship}
              onAddRelationship={onAddRelationship}
              isUpdating={isUpdating}
            />
          </TabsContent>

          <TabsContent value="notes" className="p-6 m-0">
            <NotesTab
              isEditing={isEditing}
              notes={viewModel.notes}
              editedNotes={editedData?.notes || null}
              onNotesChange={(notes) => onEditedDataChange('notes', notes)}
            />
          </TabsContent>

          <TabsContent value="related" className="p-6 m-0">
            <RelatedTab
              characterId={characterId}
              campaignId={campaignId}
            />
          </TabsContent>
        </div>
      </Tabs>

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
