'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { Plus, Trash2 } from 'lucide-react';
import { questFormSchema, type QuestFormData } from '@/lib/schemas/quests';
import type { NPCDTO } from '@/types/npcs';
import type { StoryArcDTO } from '@/types/story-arcs';

interface QuestFormDialogProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: QuestFormData;
  campaignId: string;
  npcs: NPCDTO[];
  storyArcs: StoryArcDTO[];
  onClose: () => void;
  onSubmit: (data: QuestFormData) => Promise<void>;
}

export function QuestFormDialog({
  isOpen,
  mode,
  initialData,
  campaignId,
  npcs,
  storyArcs,
  onClose,
  onSubmit,
}: QuestFormDialogProps) {
  const form = useForm({
    resolver: zodResolver(questFormSchema),
    defaultValues: initialData || {
      title: '',
      quest_type: 'side',
      quest_giver_id: null,
      story_arc_id: null,
      status: 'not_started',
      description_json: null,
      objectives_json: [],
      rewards_json: {
        gold: null,
        items: null,
        xp: null,
        other: null,
      },
      notes: null,
      start_date: null,
      deadline: null,
    },
  });

  const {
    fields: objectiveFields,
    append: appendObjective,
    remove: removeObjective,
  } = useFieldArray({
    control: form.control,
    name: 'objectives_json',
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const handleSubmit = async (data: QuestFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Quest' : 'Edit Quest'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Quest title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quest Type + Status (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quest_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quest Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="side">Side Quest</SelectItem>
                        <SelectItem value="main">Main Quest</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Quest Giver + Story Arc (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quest_giver_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quest Giver</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === 'none' ? null : value)
                      }
                      defaultValue={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select NPC" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {npcs.map((npc) => (
                          <SelectItem key={npc.id} value={npc.id}>
                            {npc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="story_arc_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Arc</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === 'none' ? null : value)
                      }
                      defaultValue={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select story arc" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {storyArcs.map((arc) => (
                          <SelectItem key={arc.id} value={arc.id}>
                            {arc.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description_json"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      campaignId={campaignId}
                      placeholder="Describe the quest, use @mentions to link entities..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Objectives (dynamic list) */}
            <div className="space-y-3">
              <Label>Objectives</Label>
              {objectiveFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <Checkbox
                    checked={form.watch(`objectives_json.${index}.completed`)}
                    onCheckedChange={(checked) =>
                      form.setValue(`objectives_json.${index}.completed`, !!checked)
                    }
                  />
                  <Input
                    {...form.register(`objectives_json.${index}.description`)}
                    placeholder="Objective description"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeObjective(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendObjective({ description: '', completed: false })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Objective
              </Button>
            </div>

            {/* Rewards (2x2 grid) */}
            <div className="space-y-3">
              <Label>Rewards</Label>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rewards_json.gold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gold</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rewards_json.xp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Points</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rewards_json.items"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Items (comma-separated)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value?.join(', ') || ''}
                          onChange={(e) => {
                            const items = e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean);
                            field.onChange(items.length > 0 ? items : null);
                          }}
                          placeholder="Ring of Protection, +1 Longsword"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rewards_json.other"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Other Rewards</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ''}
                          placeholder="Free lodging, NPC gratitude..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes & Clues</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Important clues, hints, or DM notes..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date (in-game)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder="e.g., 15 Mirtul 1492 DR"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline (in-game)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder="e.g., 20 Mirtul 1492 DR"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Saving...'
                  : mode === 'create'
                    ? 'Create Quest'
                    : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
