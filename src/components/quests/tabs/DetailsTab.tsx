'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { User } from 'lucide-react';
import type { QuestDetailsViewModel } from '@/types/quests';
import type { NPCDTO } from '@/types/npcs';
import type { StoryArcDTO } from '@/types/story-arcs';
import type { JSONContent } from '@tiptap/core';
import type { QuestObjective, QuestRewards } from '@/types/quests';

interface DetailsTabProps {
  viewModel: QuestDetailsViewModel;
  campaignId: string;
  npcs: NPCDTO[];
  storyArcs: StoryArcDTO[];
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

export function DetailsTab({
  viewModel,
  campaignId,
  npcs,
  storyArcs,
  isEditing,
  editedData,
  onEditedDataChange,
}: DetailsTabProps) {
  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="rounded-lg bg-muted/30 p-4 space-y-3">
        <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-border/50">Description</h3>
        <RichTextEditor
          value={
            isEditing && editedData
              ? editedData.description_json
              : viewModel.quest.description_json
          }
          onChange={(value) => onEditedDataChange('description_json', value)}
          campaignId={campaignId}
          readonly={!isEditing}
          placeholder="Describe the quest, use @mentions to link entities..."
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        {isEditing && editedData ? (
          <Select
            value={editedData.status}
            onValueChange={(value) =>
              onEditedDataChange(
                'status',
                value as 'not_started' | 'active' | 'completed' | 'failed'
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm capitalize">{viewModel.quest.status.replace('_', ' ')}</div>
        )}
      </div>

      {/* Quest Giver */}
      <div className="space-y-2">
        <Label>Quest Giver</Label>
        {isEditing && editedData ? (
          <Select
            value={editedData.quest_giver_id || 'none'}
            onValueChange={(value) =>
              onEditedDataChange('quest_giver_id', value === 'none' ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select NPC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {npcs.map((npc) => (
                <SelectItem key={npc.id} value={npc.id}>
                  {npc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-2">
            {viewModel.quest.quest_giver_name ? (
              <>
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{viewModel.quest.quest_giver_name}</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">No quest giver assigned</span>
            )}
          </div>
        )}
      </div>

      {/* Story Arc */}
      <div className="space-y-2">
        <Label>Story Arc</Label>
        {isEditing && editedData ? (
          <Select
            value={editedData.story_arc_id || 'none'}
            onValueChange={(value) =>
              onEditedDataChange('story_arc_id', value === 'none' ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Story Arc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {storyArcs.map((arc) => (
                <SelectItem key={arc.id} value={arc.id}>
                  {arc.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm">
            {viewModel.quest.story_arc_name || (
              <span className="text-muted-foreground">No story arc assigned</span>
            )}
          </div>
        )}
      </div>

      {/* Notes & Clues */}
      <div className="space-y-2">
        <Label>Notes & Clues</Label>
        {isEditing && editedData ? (
          <Textarea
            value={editedData.notes || ''}
            onChange={(e) => onEditedDataChange('notes', e.target.value)}
            placeholder="Important clues, hints, or DM notes..."
            rows={4}
          />
        ) : (
          <div className="whitespace-pre-wrap text-sm">
            {viewModel.quest.notes || (
              <span className="text-muted-foreground">No notes</span>
            )}
          </div>
        )}
      </div>

      {/* Dates (optional) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date (in-game)</Label>
          {isEditing && editedData ? (
            <Input
              type="text"
              value={editedData.start_date || ''}
              onChange={(e) => onEditedDataChange('start_date', e.target.value)}
              placeholder="e.g., 15 Mirtul 1492 DR"
            />
          ) : (
            <div className="text-sm">{viewModel.quest.start_date || '—'}</div>
          )}
        </div>
        <div className="space-y-2">
          <Label>Deadline (in-game)</Label>
          {isEditing && editedData ? (
            <Input
              type="text"
              value={editedData.deadline || ''}
              onChange={(e) => onEditedDataChange('deadline', e.target.value)}
              placeholder="e.g., 20 Mirtul 1492 DR"
            />
          ) : (
            <div className="text-sm">{viewModel.quest.deadline || '—'}</div>
          )}
        </div>
      </div>
    </div>
  );
}
