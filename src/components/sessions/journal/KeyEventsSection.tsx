'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Star } from 'lucide-react';
import type { KeyEvent } from '@/types/sessions';
import { SectionCard } from '../shared/SectionCard';

interface KeyEventsSectionProps {
  keyEvents: KeyEvent[];
  isEditing: boolean;
  onChange: (keyEvents: KeyEvent[]) => void;
}

export function KeyEventsSection({ keyEvents, isEditing, onChange }: KeyEventsSectionProps) {
  const [newEventText, setNewEventText] = useState('');

  const handleAddEvent = () => {
    if (!newEventText.trim()) return;

    const newEvent: KeyEvent = {
      id: crypto.randomUUID(),
      text: newEventText.trim(),
    };

    onChange([...keyEvents, newEvent]);
    setNewEventText('');
  };

  const handleUpdateEvent = (eventId: string, text: string) => {
    onChange(
      keyEvents.map((event) =>
        event.id === eventId ? { ...event, text } : event
      )
    );
  };

  const handleRemoveEvent = (eventId: string) => {
    onChange(keyEvents.filter((event) => event.id !== eventId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEvent();
    }
  };

  return (
    <SectionCard
      title="Key Events"
      description="Important moments and turning points"
    >
      {/* Events list */}
      <div className="space-y-2">
        {keyEvents.length === 0 && !isEditing && (
          <p className="text-sm text-muted-foreground italic py-2">
            No key events recorded
          </p>
        )}

        {keyEvents.map((event, index) => (
          <div
            key={event.id}
            className="flex items-center gap-3 p-2 rounded-md bg-muted/30"
          >
            <span className="text-muted-foreground font-mono text-xs shrink-0">
              {index + 1}.
            </span>

            {isEditing ? (
              <Input
                value={event.text}
                onChange={(e) => handleUpdateEvent(event.id, e.target.value)}
                className="flex-1 h-8"
              />
            ) : (
              <span className="flex-1 text-sm">{event.text}</span>
            )}

            {isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveEvent(event.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Add new event */}
      {isEditing && (
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={newEventText}
            onChange={(e) => setNewEventText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a key event..."
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddEvent}
            disabled={!newEventText.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      )}
    </SectionCard>
  );
}
