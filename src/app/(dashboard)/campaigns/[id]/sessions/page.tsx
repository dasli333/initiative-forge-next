'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SessionsHeader } from '@/components/sessions/SessionsHeader';
import { SessionsLayout } from '@/components/sessions/SessionsLayout';
import { CreateSessionDialog } from '@/components/sessions/CreateSessionDialog';
import { useCampaignStore } from '@/stores/campaignStore';
import {
  useSessionsQuery,
  useSessionQuery,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
} from '@/hooks/useSessions';
import { getNextSessionNumber } from '@/lib/api/sessions';
import type { SessionFilters, SessionStatus, PlanJson, LogJson } from '@/types/sessions';
import type { CreateSessionFormData } from '@/lib/schemas/sessions';

export default function SessionsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = params.id as string;

  // Get campaign from store
  const { selectedCampaign: _selectedCampaign } = useCampaignStore();

  // Local state
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    searchParams.get('selectedId') || null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<SessionFilters>({});
  const [activeTab, setActiveTab] = useState<'prep' | 'journal'>('prep');

  // Sync selectedSessionId with URL changes
  useEffect(() => {
    const urlSelectedId = searchParams.get('selectedId');
    if (urlSelectedId !== selectedSessionId) {
      setSelectedSessionId(urlSelectedId);
    }
  }, [searchParams, selectedSessionId]);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<{
    session_number: number;
    session_date: string;
    in_game_date: string | null;
    title: string | null;
    status: SessionStatus;
    plan_json: PlanJson | null;
    log_json: LogJson | null;
  } | null>(null);

  // Queries
  const { data: sessions = [], isLoading: sessionsLoading } = useSessionsQuery(campaignId, filters);
  const { data: sessionDetails, isLoading: detailsLoading } = useSessionQuery(selectedSessionId || undefined);

  // Get next session number for create dialog
  const { data: nextSessionNumber = 1 } = useQuery({
    queryKey: ['next-session-number', campaignId],
    queryFn: () => getNextSessionNumber(campaignId),
    enabled: isCreateDialogOpen,
  });

  // Mutations
  const createMutation = useCreateSessionMutation(campaignId);
  const updateMutation = useUpdateSessionMutation(campaignId);
  const deleteMutation = useDeleteSessionMutation(campaignId);

  // Handlers
  const handleSessionSelect = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId);
    router.push(`/campaigns/${campaignId}/sessions?selectedId=${sessionId}`, { scroll: false });
  }, [campaignId, router]);

  const handleEdit = useCallback(() => {
    if (sessionDetails) {
      setEditedData({
        session_number: sessionDetails.session_number,
        session_date: sessionDetails.session_date,
        in_game_date: sessionDetails.in_game_date,
        title: sessionDetails.title,
        status: sessionDetails.status as SessionStatus,
        plan_json: sessionDetails.plan_json,
        log_json: sessionDetails.log_json,
      });
      setIsEditing(true);
    }
  }, [sessionDetails]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedData(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editedData || !selectedSessionId || !sessionDetails) return;

    // Build update command with only changed fields
    const changes: Record<string, unknown> = {};
    if (editedData.session_number !== sessionDetails.session_number) {
      changes.session_number = editedData.session_number;
    }
    if (editedData.session_date !== sessionDetails.session_date) {
      changes.session_date = editedData.session_date;
    }
    if (editedData.in_game_date !== sessionDetails.in_game_date) {
      changes.in_game_date = editedData.in_game_date;
    }
    if (editedData.title !== sessionDetails.title) {
      changes.title = editedData.title;
    }
    if (editedData.status !== sessionDetails.status) {
      changes.status = editedData.status;
    }
    if (JSON.stringify(editedData.plan_json) !== JSON.stringify(sessionDetails.plan_json)) {
      changes.plan_json = editedData.plan_json;
    }
    if (JSON.stringify(editedData.log_json) !== JSON.stringify(sessionDetails.log_json)) {
      changes.log_json = editedData.log_json;
    }

    if (Object.keys(changes).length === 0) {
      setIsEditing(false);
      setEditedData(null);
      return;
    }

    await updateMutation.mutateAsync({
      id: selectedSessionId,
      command: changes,
    });

    setIsEditing(false);
    setEditedData(null);
  }, [editedData, selectedSessionId, sessionDetails, updateMutation]);

  const handleDelete = useCallback(async () => {
    if (!selectedSessionId) return;
    await deleteMutation.mutateAsync(selectedSessionId);
    setSelectedSessionId(null);
    router.push(`/campaigns/${campaignId}/sessions`, { scroll: false });
  }, [selectedSessionId, deleteMutation, campaignId, router]);

  const handleEditedDataChange = useCallback((field: string, value: unknown) => {
    setEditedData((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  }, []);

  const handleCreateSession = useCallback(async (data: CreateSessionFormData) => {
    const newSession = await createMutation.mutateAsync(data);
    setIsCreateDialogOpen(false);
    setSelectedSessionId(newSession.id);
    router.push(`/campaigns/${campaignId}/sessions?selectedId=${newSession.id}`, { scroll: false });
  }, [createMutation, campaignId, router]);

  // Reset edit mode when selection changes
  useEffect(() => {
    if (isEditing) {
      setIsEditing(false);
      setEditedData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SessionsHeader onCreateClick={() => setIsCreateDialogOpen(true)} />

      {/* Main content - 30/70 split */}
      <SessionsLayout
        // List props
        sessions={sessions}
        selectedSessionId={selectedSessionId}
        onSessionSelect={handleSessionSelect}
        filters={filters}
        onFiltersChange={setFilters}
        isLoading={sessionsLoading}
        // Detail panel props
        selectedSession={sessionDetails}
        isDetailLoading={detailsLoading}
        isEditing={isEditing}
        editedData={editedData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
      <CreateSessionDialog
        isOpen={isCreateDialogOpen}
        nextSessionNumber={nextSessionNumber}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSession}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
