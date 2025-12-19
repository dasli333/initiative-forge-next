'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GoalItem } from '@/types/sessions';

interface GoalsSectionProps {
  goals: GoalItem[];
  isEditing: boolean;
  onChange: (goals: GoalItem[]) => void;
}

export function GoalsSection({ goals, isEditing, onChange }: GoalsSectionProps) {
  const [newGoalText, setNewGoalText] = useState('');

  const handleAddGoal = () => {
    if (!newGoalText.trim()) return;

    const newGoal: GoalItem = {
      id: crypto.randomUUID(),
      text: newGoalText.trim(),
      completed: false,
    };

    onChange([...goals, newGoal]);
    setNewGoalText('');
  };

  const handleToggleGoal = (goalId: string) => {
    onChange(
      goals.map((goal) =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const handleUpdateGoalText = (goalId: string, text: string) => {
    onChange(
      goals.map((goal) =>
        goal.id === goalId ? { ...goal, text } : goal
      )
    );
  };

  const handleRemoveGoal = (goalId: string) => {
    onChange(goals.filter((goal) => goal.id !== goalId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGoal();
    }
  };

  const completedCount = goals.filter((g) => g.completed).length;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Session Goals</Label>
          <p className="text-xs text-muted-foreground">
            Objectives the party should achieve
          </p>
        </div>
        {goals.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {completedCount}/{goals.length} completed
          </span>
        )}
      </div>

      {/* Goals list */}
      <div className="space-y-2">
        {goals.length === 0 && !isEditing && (
          <p className="text-sm text-muted-foreground italic py-2">
            No goals set for this session
          </p>
        )}

        {goals.map((goal) => (
          <div
            key={goal.id}
            className={cn(
              'flex items-center gap-3 p-2 rounded-md transition-colors',
              goal.completed && 'bg-muted/50'
            )}
          >
            <Checkbox
              checked={goal.completed}
              onCheckedChange={() => handleToggleGoal(goal.id)}
              disabled={!isEditing}
              className="shrink-0"
            />

            {isEditing ? (
              <Input
                value={goal.text}
                onChange={(e) => handleUpdateGoalText(goal.id, e.target.value)}
                className={cn(
                  'flex-1 h-8',
                  goal.completed && 'line-through text-muted-foreground'
                )}
              />
            ) : (
              <span
                className={cn(
                  'flex-1 text-sm',
                  goal.completed && 'line-through text-muted-foreground'
                )}
              >
                {goal.text}
              </span>
            )}

            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveGoal(goal.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Add new goal */}
      {isEditing && (
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new goal..."
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddGoal}
            disabled={!newGoalText.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      )}
    </section>
  );
}
