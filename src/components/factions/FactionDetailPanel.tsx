'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
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
import { Pencil, Save, X, Shield, Trash2 } from 'lucide-react';
import { DetailsTab } from './tabs/DetailsTab';
import { MembersTab } from './tabs/MembersTab';
import { RelationshipsTab } from './tabs/RelationshipsTab';
import { RelatedTab } from './tabs/RelatedTab';
import { cn } from '@/lib/utils';
import type { FactionDetailsViewModel, FactionRelationshipViewModel } from '@/types/factions';
import type { JSONContent } from '@tiptap/core';

interface FactionDetailPanelProps {
  factionId: string | null;
  viewModel: FactionDetailsViewModel | undefined;
  campaignId: string;
  isLoading: boolean;
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
 * Right panel for faction details
 * - Header: Faction name (editable), Edit/Save/Cancel/Delete buttons
 * - Tabs: Details | Members | Relationships | Related
 */
export function FactionDetailPanel({
  factionId,
  viewModel,
  campaignId,
  isLoading,
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
}: FactionDetailPanelProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Empty state when no faction selected
  if (!factionId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <Shield className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Faction Selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a faction from the list to view details, or create a new one to get started.
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
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // 404 - Faction not found
  if (!viewModel) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <Shield className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Faction Not Found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          The selected faction could not be found. It may have been deleted.
        </p>
      </div>
    );
  }

  const { faction, members, relationships, backlinks } = viewModel;

  return (
    <div className={cn(
      "flex flex-col h-full transition-all",
      isEditing && "border-2 border-primary/30 rounded-lg m-1"
    )}>
      {/* Header - Name, Edit/Save/Cancel/Delete */}
      <div className={cn(
        "px-6 py-4",
        isEditing && "bg-primary/5"
      )}>
        <div className="flex items-start justify-between gap-4">
          {/* Left: Name */}
          <div className="flex-1 min-w-0">
            {isEditing && editedData ? (
              <Input
                value={editedData.name}
                onChange={(e) => onEditedDataChange('name', e.target.value)}
                className="text-2xl font-bold h-auto py-2"
                placeholder="Faction name"
                disabled={isUpdating}
              />
            ) : (
              <h2 className="text-2xl font-bold">{faction.name}</h2>
            )}
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
            <AlertDialogTitle>Delete Faction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{faction.name}</strong>?
              {members.length > 0 && (
                <span className="block mt-2 text-destructive">
                  {members.length} NPC{members.length > 1 ? 's' : ''} will be unassigned from this faction.
                </span>
              )}
              <span className="block mt-2">
                This action cannot be undone.
              </span>
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

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="details" className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="members">
                Members ({members.length})
              </TabsTrigger>
              <TabsTrigger value="relationships">
                Relationships ({relationships.length})
              </TabsTrigger>
              <TabsTrigger value="related">
                Related ({backlinks.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="details" className="mt-0 h-full">
              <DetailsTab
                faction={faction}
                campaignId={campaignId}
                isEditing={isEditing}
                editedData={editedData}
                onEditedDataChange={onEditedDataChange}
                isUpdating={isUpdating}
              />
            </TabsContent>

            <TabsContent value="members" className="mt-0 h-full">
              <MembersTab
                members={members}
                campaignId={campaignId}
                onAssignMembersClick={onAssignMembers}
                onUnassignMember={onUnassignMember}
                isUpdating={isUpdating}
              />
            </TabsContent>

            <TabsContent value="relationships" className="mt-0 h-full">
              <RelationshipsTab
                relationships={relationships}
                onAddRelationship={onAddRelationship}
                onEditRelationship={onEditRelationship}
                onDeleteRelationship={onDeleteRelationship}
                isUpdating={isUpdating}
              />
            </TabsContent>

            <TabsContent value="related" className="mt-0 h-full">
              <RelatedTab
                backlinks={backlinks}
                campaignId={campaignId}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
