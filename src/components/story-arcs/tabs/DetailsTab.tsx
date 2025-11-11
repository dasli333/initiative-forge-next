import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import type { StoryArcDTO } from '@/types/story-arcs';
import type { JSONContent } from '@tiptap/react';

interface DetailsTabProps {
  storyArc: StoryArcDTO;
  campaignId: string;
  isEditing: boolean;
  editedData: EditedStoryArcData | null;
  onEditedDataChange: (field: string, value: unknown) => void;
}

export interface EditedStoryArcData {
  title: string;
  status: 'planning' | 'active' | 'completed' | 'abandoned';
  start_date: string | null;
  end_date: string | null;
  description_json: JSONContent | null;
}

const statusColors = {
  planning: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-green-100 text-green-700',
  abandoned: 'bg-red-100 text-red-700',
};

export function DetailsTab({
  storyArc,
  campaignId,
  isEditing,
  editedData,
  onEditedDataChange,
}: DetailsTabProps) {
  return (
    <div className="space-y-6 p-6">
      {/* Title */}
      <div>
        <Label>Title</Label>
        {isEditing && editedData ? (
          <Input
            value={editedData.title}
            onChange={(e) => onEditedDataChange('title', e.target.value)}
            placeholder="Enter story arc title"
          />
        ) : (
          <h2 className="text-2xl font-bold mt-1">{storyArc.title}</h2>
        )}
      </div>

      {/* Status */}
      <div>
        <Label>Status</Label>
        {isEditing && editedData ? (
          <Select
            value={editedData.status}
            onValueChange={(val) => onEditedDataChange('status', val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="mt-1">
            <Badge className={statusColors[storyArc.status]}>
              {storyArc.status}
            </Badge>
          </div>
        )}
      </div>

      {/* Dates Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          {isEditing && editedData ? (
            <Input
              placeholder="1 Hammer, 1492 DR"
              value={editedData.start_date || ''}
              onChange={(e) =>
                onEditedDataChange('start_date', e.target.value || null)
              }
            />
          ) : (
            <div className="text-sm mt-1">
              {storyArc.start_date || (
                <span className="text-muted-foreground">No start date</span>
              )}
            </div>
          )}
        </div>
        <div>
          <Label>End Date</Label>
          {isEditing && editedData ? (
            <Input
              placeholder="15 Mirtul, 1492 DR"
              value={editedData.end_date || ''}
              onChange={(e) =>
                onEditedDataChange('end_date', e.target.value || null)
              }
            />
          ) : (
            <div className="text-sm mt-1">
              {storyArc.end_date || (
                <span className="text-muted-foreground">Ongoing</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <Label>Description</Label>
        <RichTextEditor
          value={
            isEditing && editedData
              ? editedData.description_json
              : storyArc.description_json
          }
          onChange={(val) => onEditedDataChange('description_json', val)}
          readonly={!isEditing}
          campaignId={campaignId}
          placeholder="Describe this story arc..."
        />
      </div>
    </div>
  );
}
