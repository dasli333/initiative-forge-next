'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Plus } from 'lucide-react';
import { StoryArcsLayout } from '@/components/story-arcs/StoryArcsLayout';
import { StoryArcFormDialog } from '@/components/story-arcs/StoryArcFormDialog';
import { useCampaignStore } from '@/stores/campaignStore';
import {
  useStoryArcsQuery,
  useStoryArcQuery,
  useUpdateStoryArcMutation,
  useDeleteStoryArcMutation,
} from '@/hooks/useStoryArcs';
import { useQuestsQuery } from '@/hooks/useQuests';
import type { StoryArcFilters } from '@/types/story-arcs';
import type { EditedStoryArcData } from '@/components/story-arcs/tabs/DetailsTab';

export default function StoryArcsPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedCampaign } = useCampaignStore();

  // Selection state
  const [selectedStoryArcId, setSelectedStoryArcId] = useState<string | null>(
    searchParams.get('storyArcId')
  );

  // Filter state
  const [filters, setFilters] = useState<StoryArcFilters>({});

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<EditedStoryArcData | null>(null);

  // Create dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Queries
  const { data: storyArcs = [], isLoading: isLoadingList } = useStoryArcsQuery(campaignId, filters);
  const { data: storyArcDetails, isLoading: isLoadingDetail } = useStoryArcQuery(selectedStoryArcId);
  const { data: quests = [] } = useQuestsQuery(campaignId);

  // Mutations
  const updateMutation = useUpdateStoryArcMutation(campaignId);
  const deleteMutation = useDeleteStoryArcMutation(campaignId);

  // Handlers
  const handleStoryArcSelect = useCallback(
    (storyArcId: string) => {
      setSelectedStoryArcId(storyArcId);
      router.push(`/campaigns/${campaignId}/story-arcs?storyArcId=${storyArcId}`);
    },
    [campaignId, router]
  );

  const handleEdit = useCallback(() => {
    if (storyArcDetails) {
      setEditedData({
        title: storyArcDetails.title,
        status: storyArcDetails.status as 'planning' | 'active' | 'completed' | 'abandoned',
        start_date: storyArcDetails.start_date,
        end_date: storyArcDetails.end_date,
        description_json: storyArcDetails.description_json,
      });
      setIsEditing(true);
    }
  }, [storyArcDetails]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedData(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editedData || !selectedStoryArcId || !storyArcDetails) return;

    // Diff detection
    const changes: Partial<EditedStoryArcData> = {};
    if (editedData.title !== storyArcDetails.title) changes.title = editedData.title;
    if (editedData.status !== storyArcDetails.status) changes.status = editedData.status;
    if (editedData.start_date !== storyArcDetails.start_date) changes.start_date = editedData.start_date;
    if (editedData.end_date !== storyArcDetails.end_date) changes.end_date = editedData.end_date;
    if (JSON.stringify(editedData.description_json) !== JSON.stringify(storyArcDetails.description_json)) {
      changes.description_json = editedData.description_json;
    }

    if (Object.keys(changes).length === 0) {
      setIsEditing(false);
      setEditedData(null);
      return;
    }

    await updateMutation.mutateAsync({
      id: selectedStoryArcId,
      command: changes,
    });

    setIsEditing(false);
    setEditedData(null);
  }, [editedData, selectedStoryArcId, storyArcDetails, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!selectedStoryArcId) return;

    await deleteMutation.mutateAsync(selectedStoryArcId);
    setSelectedStoryArcId(null);
    router.push(`/campaigns/${campaignId}/story-arcs`);
  }, [selectedStoryArcId, deleteMutation, campaignId, router]);

  const handleEditedDataChange = useCallback((field: string, value: unknown) => {
    setEditedData((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  }, []);

  // Reset edit mode when selection changes
  useEffect(() => {
    if (isEditing) {
      setIsEditing(false);
      setEditedData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoryArcId]);

  return (
    <div className="flex h-full flex-col">
      {/* Header with Breadcrumbs */}
      <div className="space-y-4 pb-4 border-b">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/campaigns">Campaigns</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/campaigns/${selectedCampaign?.id}`}>
                {selectedCampaign?.name || 'Campaign'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Story Arcs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Story Arcs</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" />
            New Story Arc
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <StoryArcsLayout
        storyArcs={storyArcs}
        quests={quests}
        selectedStoryArcId={selectedStoryArcId}
        onStoryArcSelect={handleStoryArcSelect}
        filters={filters}
        onFiltersChange={setFilters}
        isLoading={isLoadingList}
        selectedStoryArc={storyArcDetails}
        isDetailLoading={isLoadingDetail}
        isEditing={isEditing}
        editedData={editedData}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancelEdit={handleCancelEdit}
        onDelete={handleDelete}
        onEditedDataChange={handleEditedDataChange}
        campaignId={campaignId}
        isUpdating={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />

      {/* Create Dialog */}
      <StoryArcFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        campaignId={campaignId}
      />
    </div>
  );
}
