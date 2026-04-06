'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { BookText } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog';
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
      <EmptyState
        icon={BookText}
        title="No Story Arc Selected"
        description="Select a story arc from the list to view details, or create a new one to get started."
      />
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
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onConfirm={() => { onDelete(); setShowDeleteDialog(false); }}
        onCancel={() => setShowDeleteDialog(false)}
        isDeleting={isDeleting}
        entityName={storyArc.title}
        entityType="Story Arc"
        warning={
          <span className="block mt-2 text-destructive">
            Quests will be unlinked from this arc.
          </span>
        }
      />
    </div>
  );
}
