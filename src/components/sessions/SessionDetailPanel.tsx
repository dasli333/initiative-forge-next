'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Calendar, Pencil, Save, X, Trash2, AlertCircle, Menu, Plus } from 'lucide-react';
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog';
import { cn } from '@/lib/utils';
import { StatusBadge } from './shared/StatusBadge';
import { PrepTab } from './prep/PrepTab';
import { JournalTab } from './journal/JournalTab';
import { SessionsBrowseGrid } from './SessionsBrowseGrid';
import type { SessionDTO, SessionStatus, PlanJson, LogJson } from '@/types/sessions';

interface SessionDetailPanelProps {
  session: SessionDTO | undefined;
  sessions: SessionDTO[];
  sessionsLoading: boolean;
  onSessionSelect: (sessionId: string) => void;
  isLoading: boolean;
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
  onOpenList: () => void;
  onCreateClick: () => void;
  campaignId: string;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const statusOptions: { value: SessionStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'ready', label: 'Ready' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export function SessionDetailPanel({
  session,
  sessions,
  sessionsLoading,
  onSessionSelect,
  isLoading,
  isEditing,
  editedData,
  activeTab,
  onTabChange,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  onEditedDataChange,
  onOpenList,
  onCreateClick,
  campaignId,
  isUpdating,
  isDeleting,
}: SessionDetailPanelProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await onDelete();
    setIsDeleteDialogOpen(false);
  };

  // Always-visible top bar (drawer trigger + create) — shown even when no session selected
  const topBar = (
    <div className="flex items-center gap-2 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenList}
        aria-label="Open sessions list"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );

  if (!session && !isLoading) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b px-3 py-2 shrink-0">
          <div className="flex items-center gap-2">
            {topBar}
            <h2 className="text-lg font-bold">Sessions</h2>
            <span className="text-xs text-muted-foreground">
              {sessions.length} total
            </span>
          </div>
          <Button onClick={onCreateClick} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-1" />
            New Session
          </Button>
        </div>
        <SessionsBrowseGrid
          sessions={sessions}
          isLoading={sessionsLoading}
          onSessionSelect={onSessionSelect}
          onCreateClick={onCreateClick}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col space-y-4 p-6">
        <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        <div className="flex-1 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="space-y-2">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <p className="font-medium">Session not found</p>
        </div>
      </div>
    );
  }

  const currentData = isEditing && editedData ? editedData : {
    session_number: session.session_number,
    session_date: session.session_date,
    in_game_date: session.in_game_date,
    title: session.title,
    status: session.status as SessionStatus,
    plan_json: session.plan_json,
    log_json: session.log_json,
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden',
        isEditing && 'm-1 rounded-lg border-2 border-primary/30'
      )}
    >
      {/* Compact one-row header */}
      <div className={cn('border-b px-3 py-2 shrink-0', isEditing && 'bg-primary/5')}>
        <div className="flex items-center gap-3 flex-wrap">
          {topBar}

          {/* Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-sm font-mono text-muted-foreground shrink-0">
              #{session.session_number}
            </span>
            {isEditing ? (
              <Input
                value={currentData.title || ''}
                onChange={(e) => onEditedDataChange('title', e.target.value || null)}
                placeholder="Session title..."
                className="text-lg font-bold h-8 py-1 px-2"
              />
            ) : (
              <h2 className="text-lg font-bold truncate">
                {session.title || 'Untitled'}
              </h2>
            )}
          </div>

          {/* Meta pills */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isEditing ? (
              <>
                <Label className="text-xs">Date:</Label>
                <Input
                  type="date"
                  value={currentData.session_date}
                  onChange={(e) => onEditedDataChange('session_date', e.target.value)}
                  className="h-7 w-auto text-xs"
                />
                <Label className="text-xs ml-1">In-game:</Label>
                <Input
                  value={currentData.in_game_date || ''}
                  onChange={(e) => onEditedDataChange('in_game_date', e.target.value || null)}
                  placeholder="15 Mirtul, 1492 DR"
                  className="h-7 w-36 text-xs"
                />
                <Select
                  value={currentData.status}
                  onValueChange={(value) => onEditedDataChange('status', value)}
                >
                  <SelectTrigger className="h-7 w-[120px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(session.session_date).toLocaleDateString()}
                </span>
                {session.in_game_date && (
                  <span className="px-1.5 py-0.5 rounded bg-muted">
                    🎮 {session.in_game_date}
                  </span>
                )}
                <StatusBadge status={session.status as SessionStatus} />
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={onCancelEdit}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={onSave} disabled={isUpdating}>
                  <Save className="h-4 w-4 mr-1" />
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDeleteClick}
                  className="text-destructive hover:text-destructive h-9 w-9"
                  aria-label="Delete session"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={onCreateClick}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChange(value as 'prep' | 'journal')}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="mx-6 mt-3 w-fit shrink-0">
          <TabsTrigger value="prep">Prep</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
        </TabsList>

        <TabsContent value="prep" className="flex-1 overflow-y-auto mt-0 px-6 py-3">
          <PrepTab
            planJson={currentData.plan_json}
            isEditing={isEditing}
            onChange={(planJson) => onEditedDataChange('plan_json', planJson)}
            campaignId={campaignId}
            sessionId={session.id}
            status={currentData.status}
          />
        </TabsContent>

        <TabsContent value="journal" className="flex-1 overflow-y-auto mt-0 px-6 py-3">
          <JournalTab
            logJson={currentData.log_json}
            isEditing={isEditing}
            onChange={(logJson) => onEditedDataChange('log_json', logJson)}
            campaignId={campaignId}
          />
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isDeleting={isDeleting}
        entityName={`Session #${session.session_number}${session.title ? ` "${session.title}"` : ''}`}
        entityType="Session"
      />
    </div>
  );
}
