'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Coins, Sparkles, Package, Gift, Info } from 'lucide-react';
import type { QuestDetailsViewModel, QuestObjective, QuestRewards } from '@/types/quests';
import type { JSONContent } from '@tiptap/core';

interface RewardsTabProps {
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

export function RewardsTab({
  viewModel,
  isEditing,
  editedData,
  onEditedDataChange,
}: RewardsTabProps) {
  const rewards =
    isEditing && editedData
      ? editedData.rewards_json || {}
      : viewModel.quest.rewards_json || {};

  const handleRewardChange = (field: keyof QuestRewards, value: number | string[] | string | undefined) => {
    if (!isEditing || !editedData) return;
    const updated = { ...rewards, [field]: value };
    onEditedDataChange('rewards_json', updated);
  };

  return (
    <div className="space-y-6">
      {/* Rewards grid (2x2) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Gold */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-yellow-600" />
            Gold
          </Label>
          {isEditing ? (
            <Input
              type="number"
              min="0"
              value={rewards.gold || ''}
              onChange={(e) => handleRewardChange('gold', parseInt(e.target.value) || null)}
              placeholder="0"
            />
          ) : (
            <div className="text-lg font-medium">{rewards.gold || 0} gp</div>
          )}
        </div>

        {/* XP */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            Experience Points
          </Label>
          {isEditing ? (
            <Input
              type="number"
              min="0"
              value={rewards.xp || ''}
              onChange={(e) => handleRewardChange('xp', parseInt(e.target.value) || null)}
              placeholder="0"
            />
          ) : (
            <div className="text-lg font-medium">{rewards.xp || 0} XP</div>
          )}
        </div>

        {/* Items */}
        <div className="col-span-2 space-y-2">
          <Label className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            Items
          </Label>
          {isEditing ? (
            <Textarea
              value={rewards.items?.join(', ') || ''}
              onChange={(e) => {
                const items = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                handleRewardChange('items', items.length > 0 ? items : null);
              }}
              placeholder="e.g., Ring of Protection, +1 Longsword, Healing Potion x2"
              rows={2}
            />
          ) : (
            <div className="text-sm">
              {rewards.items && rewards.items.length > 0 ? (
                <ul className="list-inside list-disc">
                  {rewards.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted-foreground">No items</span>
              )}
            </div>
          )}
        </div>

        {/* Other rewards */}
        <div className="col-span-2 space-y-2">
          <Label className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-green-600" />
            Other Rewards
          </Label>
          {isEditing ? (
            <Textarea
              value={rewards.other || ''}
              onChange={(e) => handleRewardChange('other', e.target.value || null)}
              placeholder="e.g., Volo's eternal gratitude, safe passage through the forest"
              rows={2}
            />
          ) : (
            <div className="text-sm">
              {rewards.other || <span className="text-muted-foreground">No other rewards</span>}
            </div>
          )}
        </div>
      </div>

      {/* Helper text */}
      <div className="flex items-start gap-2 rounded bg-muted p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>
          💰 These rewards will be given to the party when the quest is marked as completed. You
          can also manually track reward distribution in session notes.
        </span>
      </div>
    </div>
  );
}
