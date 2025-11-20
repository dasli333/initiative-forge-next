'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { QuestsHeader } from '@/components/quests/QuestsHeader';
import { QuestsLayout } from '@/components/quests/QuestsLayout';
import { QuestFormDialog } from '@/components/quests/forms/QuestFormDialog';
import { useCampaignStore } from '@/stores/campaignStore';
import {
  useQuestsQuery,
  useQuestQuery,
  useCreateQuestMutation,
  useUpdateQuestMutation,
  useDeleteQuestMutation,
} from '@/hooks/useQuests';
import { useNPCsQuery } from '@/hooks/useNpcs';
import { useStoryArcsQuery } from '@/hooks/useStoryArcs';
import { calculateObjectivesProgress, formatRewardsSummary } from '@/lib/api/quests';
import { getMentionsOf, enrichMentionsWithNames } from '@/lib/api/entity-mentions';
import type { QuestCardViewModel, QuestFilters } from '@/types/quests';
import type { QuestFormData } from '@/lib/schemas/quests';
import type { JSONContent } from '@tiptap/core';
import type { QuestObjective, QuestRewards } from '@/types/quests';

/**
 * Main Quests page - 30/70 split view
 * Left: filterable quest list
 * Right: detail panel with tabs (Details | Objectives | Rewards | Related)
 */
export default function QuestsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = params.id as string;

  // Get campaign from store
  const { selectedCampaign: _selectedCampaign } = useCampaignStore();

  // Local state - sync with URL params
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(
    searchParams.get('selectedId') || null
  );

  // Sync selectedQuestId with URL changes
  useEffect(() => {
    const urlSelectedId = searchParams.get('selectedId');
    if (urlSelectedId !== selectedQuestId) {
      setSelectedQuestId(urlSelectedId);
    }
  }, [searchParams, selectedQuestId]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<QuestFilters>({});

  // Edit mode state for detail panel
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<{
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
  } | null>(null);

  // Queries
  const { data: quests = [], isLoading: questsLoading } = useQuestsQuery(campaignId, filters);
  const { data: questDetails, isLoading: detailsLoading } = useQuestQuery(selectedQuestId || undefined);
  const { data: npcs = [] } = useNPCsQuery(campaignId);
  const { data: storyArcs = [] } = useStoryArcsQuery(campaignId);

  // Fetch backlinks for selected quest
  const { data: backlinks = [] } = useQuery({
    queryKey: ['entity-mentions', 'quest', selectedQuestId],
    queryFn: async () => {
      if (!selectedQuestId) return [];
      const mentions = await getMentionsOf('quest', selectedQuestId);
      return enrichMentionsWithNames(mentions);
    },
    enabled: !!selectedQuestId,
  });

  // Mutations
  const createMutation = useCreateQuestMutation(campaignId);
  const updateMutation = useUpdateQuestMutation(campaignId);
  const deleteMutation = useDeleteQuestMutation(campaignId);

  // Transform quests to view models with progress
  const questsWithProgress: QuestCardViewModel[] = useMemo(() => {
    return quests.map((quest) => ({
      quest,
      objectivesProgress: calculateObjectivesProgress(quest.objectives_json),
      rewardsSummary: formatRewardsSummary(quest.rewards_json),
    }));
  }, [quests]);

  // Quest detail view model
  const detailViewModel = useMemo(() => {
    if (!questDetails) return undefined;
    return {
      quest: questDetails,
      objectivesProgress: calculateObjectivesProgress(questDetails.objectives_json),
      rewardsSummary: formatRewardsSummary(questDetails.rewards_json),
      relatedEntities: [], // TODO: Extract from @mentions
      backlinks: backlinks.map((mention) => ({
        source_type: mention.source_type as 'npc' | 'quest' | 'session' | 'location' | 'faction' | 'story_arc' | 'lore_note',
        source_id: mention.source_id,
        source_name: mention.source_name || '',
        source_field: mention.source_field,
      })),
    };
  }, [questDetails, backlinks]);

  // Handlers
  const handleQuestSelect = useCallback((questId: string) => {
    setSelectedQuestId(questId);
    router.push(`/campaigns/${campaignId}/quests?selectedId=${questId}`, { scroll: false });
  }, [campaignId, router]);

  const handleEdit = useCallback(() => {
    if (questDetails) {
      setEditedData({
        title: questDetails.title,
        quest_type: (questDetails.quest_type as 'main' | 'side') || 'side',
        quest_giver_id: questDetails.quest_giver_id,
        story_arc_id: questDetails.story_arc_id,
        description_json: questDetails.description_json,
        objectives_json: questDetails.objectives_json,
        rewards_json: questDetails.rewards_json,
        status: questDetails.status as 'not_started' | 'active' | 'completed' | 'failed',
        notes: questDetails.notes || null,
        start_date: questDetails.start_date || null,
        deadline: questDetails.deadline || null,
      });
      setIsEditing(true);
    }
  }, [questDetails]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedData(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editedData || !selectedQuestId || !questDetails) return;

    // Compare and extract only changed fields
    const changes: Partial<typeof editedData> = {};
    if (editedData.title !== questDetails.title) changes.title = editedData.title;
    if (editedData.quest_type !== questDetails.quest_type) changes.quest_type = editedData.quest_type;
    if (editedData.quest_giver_id !== questDetails.quest_giver_id) changes.quest_giver_id = editedData.quest_giver_id;
    if (editedData.story_arc_id !== questDetails.story_arc_id) changes.story_arc_id = editedData.story_arc_id;
    if (JSON.stringify(editedData.description_json) !== JSON.stringify(questDetails.description_json))
      changes.description_json = editedData.description_json;
    if (JSON.stringify(editedData.objectives_json) !== JSON.stringify(questDetails.objectives_json))
      changes.objectives_json = editedData.objectives_json;
    if (JSON.stringify(editedData.rewards_json) !== JSON.stringify(questDetails.rewards_json))
      changes.rewards_json = editedData.rewards_json;
    if (editedData.status !== questDetails.status) changes.status = editedData.status;
    if (editedData.notes !== questDetails.notes) changes.notes = editedData.notes;
    if (editedData.start_date !== questDetails.start_date) changes.start_date = editedData.start_date;
    if (editedData.deadline !== questDetails.deadline) changes.deadline = editedData.deadline;

    if (Object.keys(changes).length === 0) {
      setIsEditing(false);
      setEditedData(null);
      return;
    }

    await updateMutation.mutateAsync({
      id: selectedQuestId,
      command: changes,
    });

    setIsEditing(false);
    setEditedData(null);
  }, [editedData, selectedQuestId, questDetails, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!selectedQuestId) return;
    await deleteMutation.mutateAsync(selectedQuestId);
    setSelectedQuestId(null);
    router.push(`/campaigns/${campaignId}/quests`, { scroll: false });
  }, [selectedQuestId, deleteMutation, campaignId, router]);

  const handleEditedDataChange = useCallback((field: string, value: unknown) => {
    setEditedData((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  }, []);

  const handleCreateQuest = useCallback(async (data: QuestFormData) => {
    const newQuest = await createMutation.mutateAsync(data);
    setIsCreateDialogOpen(false);
    setSelectedQuestId(newQuest.id);
    router.push(`/campaigns/${campaignId}/quests?selectedId=${newQuest.id}`, { scroll: false });
  }, [createMutation, campaignId, router]);

  // Reset edit mode when selection changes
  useEffect(() => {
    if (isEditing) {
      setIsEditing(false);
      setEditedData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuestId]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <QuestsHeader onCreateClick={() => setIsCreateDialogOpen(true)} />

      {/* Main content - 30/70 split */}
      <QuestsLayout
        // List props
        quests={questsWithProgress}
        selectedQuestId={selectedQuestId}
        onQuestSelect={handleQuestSelect}
        npcs={npcs}
        storyArcs={storyArcs}
        filters={filters}
        onFiltersChange={setFilters}
        isLoading={questsLoading}
        // Detail panel props
        detailViewModel={detailViewModel}
        isDetailLoading={detailsLoading}
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
      <QuestFormDialog
        isOpen={isCreateDialogOpen}
        mode="create"
        campaignId={campaignId}
        npcs={npcs}
        storyArcs={storyArcs}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateQuest}
      />
    </div>
  );
}
