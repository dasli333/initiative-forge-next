'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { BookText } from 'lucide-react';
import { DetailsTab, type EditedStoryArcData } from './tabs/DetailsTab';
import { QuestsTab } from './tabs/QuestsTab';
import { RelatedTab } from './tabs/RelatedTab';
import { cn } from '@/lib/utils';
import type { StoryArcDTO } from '@/types/story-arcs';
import type { QuestDTO } from '@/types/quests';

interface StoryArcDetailPanelProps {
  storyArcId: string | null;
  storyArc: StoryArcDTO | undefined;
  campaignId: string;
  quests: QuestDTO[];
  isLoading: boolean;
  isEditing: boolean;
  editedData: EditedStoryArcData | null;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditedDataChange: (field: string, value: unknown) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function StoryArcDetailPanel({
  storyArcId,
  storyArc,
  campaignId,
  quests,
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
}: StoryArcDetailPanelProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!storyArcId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <BookText className="h-16 w-16 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No Story Arc Selected</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select a story arc from the list to view details, or create a new one to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!storyArc) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Story arc not found</p>
      </div>
    );
  }

  const relatedQuestsCount = quests.filter((q) => q.story_arc_id === storyArcId).length;

  return (
    <div
      className={cn(
        'flex h-full flex-col',
        isEditing && 'm-1 rounded-lg border-2 border-primary/30'
      )}
    >
      {/* Header */}
      <div className={cn('border-b px-6 py-4', isEditing && 'bg-primary/5')}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{storyArc.title}</h1>
            <p className="text-sm text-muted-foreground">
              Created {format(new Date(storyArc.created_at), 'PPP')}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
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
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="flex-1 flex flex-col">
        <TabsList className="border-b w-full justify-start rounded-none px-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="quests">
            Quests
            {relatedQuestsCount > 0 && (
              <Badge variant="outline" className="ml-2">
                {relatedQuestsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="details" className="mt-0">
            <DetailsTab
              storyArc={storyArc}
              campaignId={campaignId}
              isEditing={isEditing}
              editedData={editedData}
              onEditedDataChange={onEditedDataChange}
            />
          </TabsContent>

          <TabsContent value="quests" className="mt-0">
            <QuestsTab
              storyArcId={storyArcId}
              quests={quests}
              campaignId={campaignId}
            />
          </TabsContent>

          <TabsContent value="related" className="mt-0">
            <RelatedTab storyArcId={storyArcId} campaignId={campaignId} />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story Arc?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{storyArc.title}&quot;?
              Quests will be unlinked from this arc (story_arc_id set to NULL).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
