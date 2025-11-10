'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagBadge } from './shared/TagBadge';
import { npcTagSchema, type NPCTagFormData } from '@/lib/schemas/npc-tags';
import { TAG_COLORS, TAG_ICONS, type NPCTagDTO } from '@/types/npc-tags';

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
  tags: NPCTagDTO[];
  onCreateTag: (data: NPCTagFormData) => Promise<void>;
  onUpdateTag: (tagId: string, data: Partial<NPCTagFormData>) => Promise<void>;
  onDeleteTag: (tagId: string) => Promise<void>;
}

/**
 * Dialog for managing campaign NPC tags
 * - Create new tags
 * - Edit existing tags (name, color, icon)
 * - Delete tags
 */
export function TagManager({
  isOpen,
  onClose,
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}: TagManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<NPCTagFormData>({
    resolver: zodResolver(npcTagSchema),
    defaultValues: {
      name: '',
      color: 'emerald',
      icon: 'Tag',
    },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');
  const IconComponent = (LucideIcons as Record<string, React.ComponentType>)[selectedIcon] || LucideIcons.Tag;

  const handleCreate = async (data: NPCTagFormData) => {
    await onCreateTag(data);
    setIsCreating(false);
    reset();
  };

  const handleStartEdit = (tag: NPCTagDTO) => {
    setEditingId(tag.id);
    setValue('name', tag.name);
    setValue('color', tag.color);
    setValue('icon', tag.icon);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const handleUpdate = async (data: NPCTagFormData) => {
    if (!editingId) return;
    await onUpdateTag(editingId, data);
    setEditingId(null);
    reset();
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await onDeleteTag(deletingId);
    setDeletingId(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Create and manage tags to categorize your NPCs
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Create new tag form */}
            {isCreating || editingId ? (
              <form
                onSubmit={handleSubmit(isCreating ? handleCreate : handleUpdate)}
                className="p-4 border rounded-lg space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register('name')} placeholder="e.g., Ally, Enemy" />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Select value={selectedColor} onValueChange={(value) => setValue('color', value)}>
                      <SelectTrigger id="color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TAG_COLORS.map((color) => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-sm border"
                                style={{ backgroundColor: `var(--${color}-500, ${color})` }}
                              />
                              <span className="capitalize">{color}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                    <Select value={selectedIcon} onValueChange={(value) => setValue('icon', value)}>
                      <SelectTrigger id="icon">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TAG_ICONS.map((icon) => {
                          const Icon = (LucideIcons as Record<string, React.ComponentType<{ size?: number }>>)[icon] || LucideIcons.Tag;
                          return (
                            <SelectItem key={icon} value={icon}>
                              <div className="flex items-center gap-2">
                                <Icon size={16} />
                                <span>{icon}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <TagBadge
                      tag={{
                        id: 'preview',
                        campaign_id: '',
                        name: watch('name') || 'Tag Name',
                        color: selectedColor,
                        icon: selectedIcon,
                        created_at: '',
                        updated_at: '',
                      }}
                      size="md"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    <Check className="w-4 h-4 mr-2" />
                    {isCreating ? 'Create' : 'Save'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isCreating) setIsCreating(false);
                      else handleCancelEdit();
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button onClick={() => setIsCreating(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create New Tag
              </Button>
            )}

            {/* Tags list */}
            <div className="space-y-2">
              {tags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No tags yet. Create your first tag above.
                </p>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                  >
                    <TagBadge tag={tag} size="md" />
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(tag)}
                        disabled={isCreating || editingId !== null}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingId(tag.id)}
                        disabled={isCreating || editingId !== null}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tag? It will be removed from all NPCs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
