'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { NPCTagDTO } from '@/types/npc-tags';
import { TAG_COLORS, TAG_ICONS } from '@/types/npc-tags';

interface TagManagerProps {
  campaignId: string;
  npcId: string;
  assignedTags: NPCTagDTO[];
  availableTags: NPCTagDTO[];
  onAssign: (tagId: string) => Promise<void>;
  onUnassign: (tagId: string) => Promise<void>;
  onCreate: (name: string, color: string, icon: string) => Promise<NPCTagDTO>;
  disabled?: boolean;
  maxTags?: number;
}

/**
 * Tag manager for NPCs
 * - Display assigned tags with remove button
 * - Add tag popover: select existing or create new
 * - Max 5 tags per NPC
 * - Pattern similar to LanguageSelector
 */
export function TagManager({
  campaignId,
  npcId,
  assignedTags,
  availableTags,
  onAssign,
  onUnassign,
  onCreate,
  disabled = false,
  maxTags = 5,
}: TagManagerProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<string>('blue');
  const [newTagIcon, setNewTagIcon] = useState<string>('Tag');
  const [isLoading, setIsLoading] = useState(false);

  const isMaxReached = assignedTags.length >= maxTags;

  // Filter out already assigned tags
  const unassignedTags = availableTags.filter(
    (tag) => !assignedTags.some((assigned) => assigned.id === tag.id)
  );

  const handleAssign = async (tagId: string) => {
    if (isMaxReached) return;
    setIsLoading(true);
    try {
      await onAssign(tagId);
      setIsPopoverOpen(false);
    } catch (error) {
      console.error('Failed to assign tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassign = async (tagId: string) => {
    setIsLoading(true);
    try {
      await onUnassign(tagId);
    } catch (error) {
      console.error('Failed to unassign tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;
    if (isMaxReached) return;

    setIsLoading(true);
    try {
      const newTag = await onCreate(trimmed, newTagColor, newTagIcon);
      // Auto-assign the newly created tag
      await onAssign(newTag.id);
      setNewTagName('');
      setNewTagColor('blue');
      setNewTagIcon('Tag');
      setIsCreating(false);
      setIsPopoverOpen(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIconComponent = (iconName: string): React.ComponentType<{ size?: number }> => {
    const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ size?: number }>>)[iconName];
    return IconComponent || LucideIcons.Tag;
  };

  const getColorClass = (color: string) => {
    // Map color names to Tailwind classes
    const colorMap: Record<string, string> = {
      slate: 'bg-slate-500',
      gray: 'bg-gray-500',
      zinc: 'bg-zinc-500',
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      amber: 'bg-amber-500',
      yellow: 'bg-yellow-500',
      lime: 'bg-lime-500',
      green: 'bg-green-500',
      emerald: 'bg-emerald-500',
      teal: 'bg-teal-500',
      cyan: 'bg-cyan-500',
      sky: 'bg-sky-500',
      blue: 'bg-blue-500',
      indigo: 'bg-indigo-500',
      violet: 'bg-violet-500',
      purple: 'bg-purple-500',
      fuchsia: 'bg-fuchsia-500',
      pink: 'bg-pink-500',
      rose: 'bg-rose-500',
    };
    return colorMap[color] || 'bg-blue-500';
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* Assigned tags */}
      {assignedTags.map((tag) => {
        const Icon = getIconComponent(tag.icon);
        return (
          <Badge
            key={tag.id}
            className={`${getColorClass(tag.color)} text-white text-xs gap-1.5 pr-1 border-none`}
          >
            <Icon className="w-3 h-3" />
            {tag.name}
            <button
              type="button"
              onClick={() => handleUnassign(tag.id)}
              disabled={disabled || isLoading}
              className="hover:bg-white/20 rounded-sm p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        );
      })}

      {/* Add tag button */}
      {!isMaxReached && (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isLoading}
              className="h-6 text-xs gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Add Tag</h4>
                <p className="text-xs text-muted-foreground">
                  Select an existing tag or create a new one
                </p>
              </div>

              {/* Existing tags */}
              {!isCreating && unassignedTags.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Existing Tags
                  </Label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {unassignedTags.map((tag) => {
                      const Icon = getIconComponent(tag.icon);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleAssign(tag.id)}
                          disabled={isLoading}
                          className={`${getColorClass(tag.color)} text-white text-xs px-2 py-1 rounded-md flex items-center gap-1.5 hover:opacity-80 transition-opacity disabled:opacity-50`}
                        >
                          <Icon className="w-3 h-3" />
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Create new tag */}
              {!isCreating && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(true)}
                  className="w-full text-xs"
                >
                  + Create New Tag
                </Button>
              )}

              {isCreating && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tag Name</Label>
                    <Input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="e.g., Villain, Boss"
                      disabled={isLoading}
                      maxLength={30}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Color</Label>
                      <Select
                        value={newTagColor}
                        onValueChange={setNewTagColor}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TAG_COLORS.map((color) => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${getColorClass(color)}`}
                                />
                                {color}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Icon</Label>
                      <Select
                        value={newTagIcon}
                        onValueChange={setNewTagIcon}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TAG_ICONS.map((icon) => {
                            const Icon = getIconComponent(icon);
                            return (
                              <SelectItem key={icon} value={icon}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-3 h-3" />
                                  {icon}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCreating(false);
                        setNewTagName('');
                      }}
                      disabled={isLoading}
                      className="flex-1 h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreate}
                      disabled={isLoading || !newTagName.trim()}
                      className="flex-1 h-8 text-xs"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Create & Add'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Tag count */}
              <p className="text-xs text-muted-foreground text-center">
                {assignedTags.length}/{maxTags} tags assigned
              </p>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {isMaxReached && (
        <span className="text-xs text-muted-foreground">(max reached)</span>
      )}
    </div>
  );
}
