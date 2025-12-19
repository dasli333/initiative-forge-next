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
import { Calendar, Pencil, Save, X, Trash2, AlertCircle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from './shared/StatusBadge';
import { PrepTab } from './prep/PrepTab';
import { JournalTab } from './journal/JournalTab';
import type { SessionDTO, SessionStatus, PlanJson, LogJson } from '@/types/sessions';

interface SessionDetailPanelProps {
  session: SessionDTO | undefined;
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

  // Empty state
  if (!session && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No Session Selected</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select a session from the list to view details, or create a new one to get started.
            </p>
          </div>
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
      {/* Header */}
      <div className={cn('border-b px-6 py-4 shrink-0', isEditing && 'bg-primary/5')}>
        <div className="space-y-3">
          {/* Title row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEditing ? (
                <Input
                  value={currentData.title || ''}
                  onChange={(e) => onEditedDataChange('title', e.target.value || null)}
                  placeholder="Session title..."
                  className="text-2xl font-bold h-auto py-1 px-2"
                />
              ) : (
                <h2 className="text-2xl font-bold">
                  Session #{session.session_number}
                  {session.title && `: ${session.title}`}
                </h2>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
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
                    size="sm"
                    onClick={handleDeleteClick}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Meta row: dates + status */}
          <div className="flex items-center gap-4 text-sm">
            {/* Session date */}
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">Date:</Label>
                <Input
                  type="date"
                  value={currentData.session_date}
                  onChange={(e) => onEditedDataChange('session_date', e.target.value)}
                  className="h-8 w-auto"
                />
              </div>
            ) : (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(session.session_date).toLocaleDateString()}
              </span>
            )}

            {/* In-game date */}
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">In-game:</Label>
                <Input
                  value={currentData.in_game_date || ''}
                  onChange={(e) => onEditedDataChange('in_game_date', e.target.value || null)}
                  placeholder="15 Mirtul, 1492 DR"
                  className="h-8 w-40"
                />
              </div>
            ) : (
              session.in_game_date && (
                <span className="text-muted-foreground">
                  🎮 {session.in_game_date}
                </span>
              )
            )}

            {/* Status */}
            {isEditing ? (
              <Select
                value={currentData.status}
                onValueChange={(value) => onEditedDataChange('status', value)}
              >
                <SelectTrigger className="h-8 w-[140px]">
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
            ) : (
              <StatusBadge status={session.status as SessionStatus} />
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
        <TabsList className="mx-6 mt-4 w-fit shrink-0">
          <TabsTrigger value="prep">Prep</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
        </TabsList>

        <TabsContent value="prep" className="flex-1 overflow-y-auto mt-0 px-6 py-4">
          <PrepTab
            planJson={currentData.plan_json}
            isEditing={isEditing}
            onChange={(planJson) => onEditedDataChange('plan_json', planJson)}
            campaignId={campaignId}
          />
        </TabsContent>

        <TabsContent value="journal" className="flex-1 overflow-y-auto mt-0 px-6 py-4">
          <JournalTab
            logJson={currentData.log_json}
            isEditing={isEditing}
            onChange={(logJson) => onEditedDataChange('log_json', logJson)}
            campaignId={campaignId}
          />
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Session #{session.session_number}
              {session.title && ` "${session.title}"`}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
