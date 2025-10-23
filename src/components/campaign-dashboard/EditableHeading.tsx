'use client';

import { useState, useEffect, useRef } from 'react';
import type React from 'react';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditableHeadingProps {
  value: string;
  isUpdating: boolean;
  onSave: (newValue: string) => Promise<void>;
  className?: string;
}

/**
 * Editable campaign heading component (H1)
 * Supports inline editing with keyboard shortcuts (Enter to save, Escape to cancel)
 */
export function EditableHeading({ value, isUpdating, onSave, className = '' }: EditableHeadingProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

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

  const handleEdit = () => {
    setIsEditing(true);
  };

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

    // Validation: not empty
    if (!trimmed) {
      handleCancel();
      return;
    }

    // Validation: changed
    if (trimmed === value) {
      handleCancel();
      return;
    }

    // Validation: max length
    if (trimmed.length > 255) {
      toast.error('Error', {
        description: 'Campaign name is too long (max 255 characters)',
      });
      return;
    }

    await onSave(trimmed);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={editedValue}
          onChange={(e) => setEditedValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isUpdating}
          className={`text-3xl font-bold ${className}`}
          aria-label="Edit campaign name"
        />
        {isUpdating && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
      </div>
    );
  }

  return (
    <div
      ref={headingRef}
      onClick={handleEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleEdit();
        }
      }}
      tabIndex={0}
      role="button"
      className={`text-3xl font-bold cursor-pointer hover:text-emerald-600 focus:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 transition-colors ${className}`}
      aria-label={`Campaign: ${value}. Click to edit`}
    >
      {value}
    </div>
  );
}
