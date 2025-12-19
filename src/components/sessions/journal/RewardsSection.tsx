'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Gem, Star } from 'lucide-react';
import type { LootItem } from '@/types/sessions';
import { SectionCard } from '../shared/SectionCard';

interface RewardsSectionProps {
  lootGiven: LootItem[];
  xpGiven: number;
  isEditing: boolean;
  onLootChange: (lootGiven: LootItem[]) => void;
  onXpChange: (xpGiven: number) => void;
}

export function RewardsSection({
  lootGiven,
  xpGiven,
  isEditing,
  onLootChange,
  onXpChange,
}: RewardsSectionProps) {
  const [newLootName, setNewLootName] = useState('');

  const handleAddLoot = () => {
    if (!newLootName.trim()) return;

    const newLoot: LootItem = {
      id: crypto.randomUUID(),
      name: newLootName.trim(),
    };

    onLootChange([...lootGiven, newLoot]);
    setNewLootName('');
  };

  const handleUpdateLoot = (lootId: string, name: string) => {
    onLootChange(
      lootGiven.map((loot) =>
        loot.id === lootId ? { ...loot, name } : loot
      )
    );
  };

  const handleRemoveLoot = (lootId: string) => {
    onLootChange(lootGiven.filter((loot) => loot.id !== lootId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLoot();
    }
  };

  return (
    <SectionCard
      title="Rewards"
      description="Loot and experience given this session"
    >
      {/* XP Given */}
      <div className="flex items-center gap-3 mb-4">
        <Star className="h-4 w-4 text-amber-500 shrink-0" />
        <Label className="shrink-0">XP Given:</Label>
        {isEditing ? (
          <Input
            type="number"
            min={0}
            value={xpGiven}
            onChange={(e) => onXpChange(parseInt(e.target.value) || 0)}
            className="w-32 h-8"
          />
        ) : (
          <span className="font-medium">{xpGiven.toLocaleString()} XP</span>
        )}
      </div>

      {/* Loot list */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Gem className="h-4 w-4 text-purple-500" />
          Loot Given
        </Label>

        <div className="space-y-2 ml-6">
          {lootGiven.length === 0 && !isEditing && (
            <p className="text-sm text-muted-foreground italic">
              No loot given
            </p>
          )}

          {lootGiven.map((loot) => (
            <div key={loot.id} className="flex items-center gap-2">
              <span className="text-muted-foreground">•</span>

              {isEditing ? (
                <Input
                  value={loot.name}
                  onChange={(e) => handleUpdateLoot(loot.id, e.target.value)}
                  className="flex-1 h-8"
                />
              ) : (
                <span className="flex-1 text-sm">{loot.name}</span>
              )}

              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveLoot(loot.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {/* Add new loot */}
          {isEditing && (
            <div className="flex items-center gap-2">
              <Input
                value={newLootName}
                onChange={(e) => setNewLootName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add loot item..."
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddLoot}
                disabled={!newLootName.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
