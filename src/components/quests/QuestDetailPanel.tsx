'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Scroll, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DetailsTab } from './tabs/DetailsTab';
import { ObjectivesTab } from './tabs/ObjectivesTab';
import { RewardsTab } from './tabs/RewardsTab';
import { RelatedTab } from './tabs/RelatedTab';
import type { QuestDetailsViewModel } from '@/types/quests';
import type { NPCDTO } from '@/types/npcs';
import type { StoryArcDTO } from '@/types/story-arcs';
import type { JSONContent } from '@tiptap/core';
import type { QuestObjective, QuestRewards } from '@/types/quests';

interface QuestDetailPanelProps {
  questId: string | null;
  viewModel: QuestDetailsViewModel | undefined;
  campaignId: string;
  npcs: NPCDTO[];
  storyArcs: StoryArcDTO[];
  isLoading: boolean;
  isEditing: boolean;
  editedData: {
    title: string;
    quest_type: 'main' | 'side';
    quest_giver_id: string | null;
    story_arc_id: string | null;
    description_json: JSONContent | null;
    objectives_json: QuestObjective[] | null;
    rewards_json: QuestRewards | null;
    status: 'not_started' | 'active' | 'completed' | 'failed';
    notes: string | null;
    start_date: string | null;
    deadline: string | null;
  } | null;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditedDataChange: (field: string, value: unknown) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function QuestDetailPanel({
  questId,
  viewModel,
  campaignId,
  npcs,
  storyArcs,
  isLoading,
  isEditing,
  editedData,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  onEditedDataChange,
  isUpdating,
  isDeleting,
}: QuestDetailPanelProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await onDelete();
    setIsDeleteDialogOpen(false);
  };

  // Empty state (no quest selected)
  if (!questId) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="space-y-2">
          <Scroll className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Select a quest to view details</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full flex-col space-y-4 p-6">
        <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        <div className="flex-1 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  // 404 state
  if (!viewModel) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="space-y-2">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <p className="font-medium">Quest not found</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    not_started: 'bg-gray-100 text-gray-700 border-gray-300',
    active: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    completed: 'bg-green-100 text-green-700 border-green-300',
    failed: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col',
        isEditing && 'm-1 rounded-lg border-2 border-primary/30'
      )}
    >
      {/* Header */}
      <div className={cn('border-b px-6 py-4', isEditing && 'bg-primary/5')}>
        <div className="space-y-3">
          {/* Title row + badges + actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Title */}
              <h2 className="text-2xl font-bold">{viewModel.quest.title}</h2>

              {/* Quest Type badge (only MAIN) */}
              {viewModel.quest.quest_type === 'main' && (
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-emerald-600"
                >
                  MAIN QUEST
                </Badge>
              )}

              {/* Status badge */}
              <Badge variant="outline" className={statusColors[viewModel.quest.status]}>
                {viewModel.quest.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDeleteClick}>
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={onSave} disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Story Arc + Progress */}
          <div className="flex items-center gap-4">
            {/* Story Arc */}
            {viewModel.quest.story_arc_name && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Story Arc:</span>
                <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-600">
                  {viewModel.quest.story_arc_name}
                </Badge>
              </div>
            )}

            {/* Progress bar */}
            <div className="flex flex-1 items-center gap-2">
              <span className="text-sm text-muted-foreground">Progress:</span>
              <Progress value={viewModel.objectivesProgress.percentage} className="flex-1" />
              <span className="text-sm text-muted-foreground">
                {viewModel.objectivesProgress.completed}/{viewModel.objectivesProgress.total} (
                {viewModel.objectivesProgress.percentage}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="px-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <TabsContent value="details" className="mt-0">
            <DetailsTab
              viewModel={viewModel}
              campaignId={campaignId}
              npcs={npcs}
              isEditing={isEditing}
              editedData={editedData}
              onEditedDataChange={onEditedDataChange}
            />
          </TabsContent>

          <TabsContent value="objectives" className="mt-0">
            <ObjectivesTab
              viewModel={viewModel}
              isEditing={isEditing}
              editedData={editedData}
              onEditedDataChange={onEditedDataChange}
            />
          </TabsContent>

          <TabsContent value="rewards" className="mt-0">
            <RewardsTab
              viewModel={viewModel}
              isEditing={isEditing}
              editedData={editedData}
              onEditedDataChange={onEditedDataChange}
            />
          </TabsContent>

          <TabsContent value="related" className="mt-0">
            <RelatedTab viewModel={viewModel} campaignId={campaignId} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quest</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{viewModel.quest.title}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
