'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, BookOpen, Swords, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Encounter } from '@/types/sessions';
import { SectionCard } from '../shared/SectionCard';

interface EncountersSectionProps {
  encounters: Encounter[];
  isEditing: boolean;
  onChange: (encounters: Encounter[]) => void;
}

const encounterTypeConfig = {
  story: {
    icon: BookOpen,
    label: 'Story',
    className: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  combat: {
    icon: Swords,
    label: 'Combat',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
};

export function EncountersSection({ encounters, isEditing, onChange }: EncountersSectionProps) {
  const [newEncounterName, setNewEncounterName] = useState('');
  const [newEncounterType, setNewEncounterType] = useState<'story' | 'combat'>('story');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAddEncounter = () => {
    if (!newEncounterName.trim()) return;

    const newEncounter: Encounter = {
      id: crypto.randomUUID(),
      type: newEncounterType,
      name: newEncounterName.trim(),
      description: undefined,
    };

    onChange([...encounters, newEncounter]);
    setNewEncounterName('');
  };

  const handleUpdateEncounter = (id: string, updates: Partial<Encounter>) => {
    onChange(
      encounters.map((enc) =>
        enc.id === id ? { ...enc, ...updates } : enc
      )
    );
  };

  const handleRemoveEncounter = (id: string) => {
    onChange(encounters.filter((enc) => enc.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEncounter();
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <SectionCard
      title="Planned Encounters"
      description="Story and combat encounters for this session"
    >
      {/* Encounters list */}
      <div className="space-y-2">
        {encounters.length === 0 && !isEditing && (
          <p className="text-sm text-muted-foreground italic py-2">
            No encounters planned
          </p>
        )}

        {encounters.map((encounter) => {
          const config = encounterTypeConfig[encounter.type];
          const Icon = config.icon;
          const isExpanded = expandedId === encounter.id;

          return (
            <div
              key={encounter.id}
              className="border rounded-md overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-3">
                <Badge variant="outline" className={cn('shrink-0', config.className)}>
                  <Icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>

                {isEditing ? (
                  <>
                    <Select
                      value={encounter.type}
                      onValueChange={(value) =>
                        handleUpdateEncounter(encounter.id, { type: value as 'story' | 'combat' })
                      }
                    >
                      <SelectTrigger className="w-[100px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="story">Story</SelectItem>
                        <SelectItem value="combat">Combat</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      value={encounter.name}
                      onChange={(e) =>
                        handleUpdateEncounter(encounter.id, { name: e.target.value })
                      }
                      className="flex-1 h-8"
                    />
                  </>
                ) : (
                  <span className="flex-1 font-medium text-sm">{encounter.name}</span>
                )}

                {/* Expand/collapse for description */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => toggleExpanded(encounter.id)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveEncounter(encounter.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Description (collapsible) */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t bg-muted/30">
                  {isEditing ? (
                    <Textarea
                      value={encounter.description || ''}
                      onChange={(e) =>
                        handleUpdateEncounter(encounter.id, { description: e.target.value || undefined })
                      }
                      placeholder="Add encounter details..."
                      className="mt-3 min-h-[80px]"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground mt-3">
                      {encounter.description || 'No description'}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new encounter */}
      {isEditing && (
        <div className="flex items-center gap-2">
          <Select
            value={newEncounterType}
            onValueChange={(value) => setNewEncounterType(value as 'story' | 'combat')}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="story">Story</SelectItem>
              <SelectItem value="combat">Combat</SelectItem>
            </SelectContent>
          </Select>

          <Input
            value={newEncounterName}
            onChange={(e) => setNewEncounterName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add an encounter..."
            className="flex-1"
          />

          <Button
            type="button"
            size="sm"
            onClick={handleAddEncounter}
            disabled={!newEncounterName.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      )}
    </SectionCard>
  );
}
