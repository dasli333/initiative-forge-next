'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SessionsList } from './SessionsList';
import { SessionDetailPanel } from './SessionDetailPanel';
import type { SessionDTO, PlanJson, LogJson, SessionStatus } from '@/types/sessions';

interface SessionsLayoutProps {
  sessions: SessionDTO[];
  selectedSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  isLoading: boolean;

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
  onCreateClick: () => void;
  campaignId: string;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function SessionsLayout({
  sessions,
  selectedSessionId,
  onSessionSelect,
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
  onCreateClick,
  campaignId,
  isUpdating,
  isDeleting,
}: SessionsLayoutProps) {
  const [isListOpen, setIsListOpen] = useState(false);

  const handleSessionSelect = (sessionId: string) => {
    onSessionSelect(sessionId);
    setIsListOpen(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Full-width detail panel */}
      <div className="flex-1 overflow-hidden">
        <SessionDetailPanel
          session={selectedSession}
          sessions={sessions}
          sessionsLoading={isLoading}
          onSessionSelect={handleSessionSelect}
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
          onOpenList={() => setIsListOpen(true)}
          onCreateClick={onCreateClick}
          campaignId={campaignId}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      </div>

      {/* Sessions list drawer */}
      <Sheet open={isListOpen} onOpenChange={setIsListOpen}>
        <SheetContent side="left" className="p-0 w-[320px] sm:max-w-[320px] flex flex-col">
          <SheetHeader className="border-b">
            <SheetTitle>
              Sessions
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {sessions.length}
              </span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <SessionsList
              sessions={sessions}
              selectedSessionId={selectedSessionId}
              onSessionSelect={handleSessionSelect}
              isLoading={isLoading}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
