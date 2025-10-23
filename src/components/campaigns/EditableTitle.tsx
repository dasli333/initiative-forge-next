'use client';

import { useState, useEffect, useRef } from 'react';
import type React from 'react';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface EditableTitleProps {
  /** Current campaign name */
  value: string;
  /** Whether the title is in edit mode */
  isEditing: boolean;
  /** Whether the title is being saved */
  isUpdating: boolean;
  /** Callback to enter edit mode */
  onEdit: () => void;
  /** Callback to save the new value */
  onSave: (newValue: string) => Promise<void>;
  /** Callback to cancel editing */
  onCancel: () => void;
}

/**
 * Editable campaign title component
 * Supports inline editing with keyboard shortcuts (Enter to save, Escape to cancel)
 */
export function EditableTitle({ value, isEditing, isUpdating, onEdit, onSave, onCancel }: EditableTitleProps) {
  const [editedValue, setEditedValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update edited value when value prop changes
  useEffect(() => {
    setEditedValue(value);
  }, [value]);

  // Focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleSave = async () => {
    const trimmed = editedValue.trim();

    // Don't save if empty or unchanged
    if (!trimmed || trimmed === value) {
      onCancel();
      return;
    }

    await onSave(trimmed);
  };

  const handleCancel = () => {
    setEditedValue(value);
    onCancel();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          data-testid="campaign-name-edit-input"
          value={editedValue}
          onChange={(e) => setEditedValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isUpdating}
          className="font-semibold text-lg"
          aria-label="Edit campaign name"
        />
        <button
          type="button"
          data-testid="save-campaign-name"
          onClick={handleSave}
          disabled={isUpdating}
          className="text-emerald-600 hover:text-emerald-700 font-medium text-sm px-2"
          aria-label="Save campaign name"
        >
          Save
        </button>
        {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>
    );
  }

  return (
    <button
      onClick={onEdit}
      className="font-semibold text-lg text-left cursor-pointer hover:text-emerald-600 transition-colors bg-transparent border-none p-0"
      type="button"
      aria-label={`Campaign: ${value}. Click to edit`}
    >
      {value}
    </button>
  );
}
