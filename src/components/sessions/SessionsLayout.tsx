'use client';

import { SplitLayout } from '@/components/shared/SplitLayout';
import { SessionsList } from './SessionsList';
import { SessionDetailPanel } from './SessionDetailPanel';
import type { SessionDTO, SessionFilters, PlanJson, LogJson, SessionStatus } from '@/types/sessions';

interface SessionsLayoutProps {
  // List props
  sessions: SessionDTO[];
  selectedSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  filters: SessionFilters;
  onFiltersChange: (filters: SessionFilters) => void;
  isLoading: boolean;

  // Detail panel props
  selectedSession: SessionDTO | undefined;
  isDetailLoading: boolean;
  isEditing: boolean;
  editedData: {
    session_number: number;
    session_date: string;
    in_game_date: string | null;
    title: string | null;
    status: SessionStatus;
    plan_json: PlanJson | null;
    log_json: LogJson | null;
  } | null;
  activeTab: 'prep' | 'journal';
  onTabChange: (tab: 'prep' | 'journal') => void;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEditedDataChange: (field: string, value: unknown) => void;
  campaignId: string;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function SessionsLayout({
  sessions,
  selectedSessionId,
  onSessionSelect,
  filters,
  onFiltersChange,
  isLoading,
  selectedSession,
  isDetailLoading,
  isEditing,
  editedData,
  activeTab,
  onTabChange,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  onEditedDataChange,
  campaignId,
  isUpdating,
  isDeleting,
}: SessionsLayoutProps) {
  return (
    <SplitLayout
      leftPanel={
        <SessionsList
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSessionSelect={onSessionSelect}
          filters={filters}
          onFiltersChange={onFiltersChange}
          isLoading={isLoading}
        />
      }
      rightPanel={
        <SessionDetailPanel
          session={selectedSession}
          isLoading={isDetailLoading}
          isEditing={isEditing}
          editedData={editedData}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onEdit={onEdit}
          onSave={onSave}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
          onEditedDataChange={onEditedDataChange}
          campaignId={campaignId}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      }
    />
  );
}
