'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuestDetailsViewModel, QuestObjective, QuestRewards } from '@/types/quests';
import type { JSONContent } from '@tiptap/core';

interface ObjectivesTabProps {
  viewModel: QuestDetailsViewModel;
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
  onEditedDataChange: (field: string, value: unknown) => void;
}

export function ObjectivesTab({
  viewModel,
  isEditing,
  editedData,
  onEditedDataChange,
}: ObjectivesTabProps) {
  const objectives =
    isEditing && editedData
      ? editedData.objectives_json || []
      : viewModel.quest.objectives_json || [];

  const handleObjectiveToggle = (index: number) => {
    if (!isEditing || !editedData) return;
    const updated = [...objectives];
    updated[index] = { ...updated[index], completed: !updated[index].completed };
    onEditedDataChange('objectives_json', updated);
  };

  const handleObjectiveTextChange = (index: number, text: string) => {
    if (!isEditing || !editedData) return;
    const updated = [...objectives];
    updated[index] = { ...updated[index], description: text };
    onEditedDataChange('objectives_json', updated);
  };

  const handleObjectiveDelete = (index: number) => {
    if (!isEditing || !editedData) return;
    const updated = objectives.filter((_, i) => i !== index);
    onEditedDataChange('objectives_json', updated);
  };

  const handleAddObjective = () => {
    if (!isEditing || !editedData) return;
    const updated = [...objectives, { description: 'New objective', completed: false }];
    onEditedDataChange('objectives_json', updated);
  };

  return (
    <div className="space-y-4">
      {/* Progress summary header */}
      <div className="flex items-center justify-between rounded-lg bg-muted p-4">
        <div className="text-lg font-medium">
          {viewModel.objectivesProgress.total} Objective{viewModel.objectivesProgress.total !== 1 ? 's' : ''}{' '}
          ({viewModel.objectivesProgress.completed} completed, {viewModel.objectivesProgress.percentage}%)
        </div>
        <Progress value={viewModel.objectivesProgress.percentage} className="w-32" />
      </div>

      {/* Objectives list */}
      <div className="space-y-2">
        {objectives.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No objectives yet. {isEditing && 'Click "Add Objective" to create one.'}
          </div>
        ) : (
          objectives.map((objective, index) => (
            <ObjectiveItem
              key={index}
              objective={objective}
              index={index}
              isEditing={isEditing}
              onToggle={handleObjectiveToggle}
              onTextChange={handleObjectiveTextChange}
              onDelete={handleObjectiveDelete}
            />
          ))
        )}
      </div>

      {/* Add objective button (only in edit mode) */}
      {isEditing && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddObjective}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Objective
        </Button>
      )}

      {/* Helper text */}
      <div className="rounded bg-muted p-3 text-xs text-muted-foreground">
        💡 Completing all objectives doesn&apos;t auto-complete the quest. Manually mark quest as
        complete when finished.
      </div>
    </div>
  );
}

// ObjectiveItem component
function ObjectiveItem({
  objective,
  index,
  isEditing,
  onToggle,
  onTextChange,
  onDelete,
}: {
  objective: QuestObjective;
  index: number;
  isEditing: boolean;
  onToggle: (index: number) => void;
  onTextChange: (index: number, text: string) => void;
  onDelete: (index: number) => void;
}) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState(objective.description);

  const handleTextBlur = () => {
    if (editText.trim() && editText !== objective.description) {
      onTextChange(index, editText.trim());
    } else {
      setEditText(objective.description);
    }
    setIsEditingText(false);
  };

  return (
    <div className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50">
      {/* Checkbox */}
      <Checkbox
        checked={objective.completed}
        onCheckedChange={() => onToggle(index)}
        disabled={!isEditing}
      />

      {/* Text */}
      <div className="min-w-0 flex-1">
        {isEditing && isEditingText ? (
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleTextBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextBlur();
              if (e.key === 'Escape') {
                setEditText(objective.description);
                setIsEditingText(false);
              }
            }}
            autoFocus
          />
        ) : (
          <div
            className={cn(
              isEditing && 'cursor-pointer',
              objective.completed && 'text-muted-foreground line-through'
            )}
            onClick={() => isEditing && setIsEditingText(true)}
          >
            {objective.description}
          </div>
        )}
      </div>

      {/* Delete button (visible in edit mode) */}
      {isEditing && (
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onDelete(index)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}
