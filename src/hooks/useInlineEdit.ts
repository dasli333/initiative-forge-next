import { useState, useCallback, useEffect, useRef } from "react";

interface UseInlineEditOptions<T> {
  initialValue: T;
  onSubmit: (value: T) => void;
  validator?: (value: T) => boolean;
}

/**
 * Custom hook for inline editing functionality
 * Provides state management and handlers for inline edit mode
 *
 * @param options - Configuration options
 * @returns Object with editing state and handlers
 *
 * @example
 * ```tsx
 * const countEdit = useInlineEdit({
 *   initialValue: monster.count,
 *   onSubmit: (newCount) => onUpdateCount(monster.id, newCount),
 *   validator: (count) => count >= 1
 * });
 *
 * return (
 *   <div>
 *     {countEdit.isEditing ? (
 *       <input
 *         ref={countEdit.inputRef}
 *         value={countEdit.editValue}
 *         onChange={(e) => countEdit.setValue(e.target.value)}
 *         onBlur={countEdit.handleSubmit}
 *         onKeyDown={countEdit.handleKeyDown}
 *       />
 *     ) : (
 *       <span onClick={countEdit.startEditing}>{countEdit.editValue}</span>
 *     )}
 *   </div>
 * );
 * ```
 */
export function useInlineEdit<T>({ initialValue, onSubmit, validator }: UseInlineEditOptions<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<T>(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with initialValue changes
  useEffect(() => {
    setEditValue(initialValue);
  }, [initialValue]);

  // Auto-focus and select when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setEditValue(initialValue);
  }, [initialValue]);

  const handleSubmit = useCallback(() => {
    // Validate if validator provided
    if (validator && !validator(editValue)) {
      setEditValue(initialValue);
      setIsEditing(false);
      return;
    }

    onSubmit(editValue);
    setIsEditing(false);
  }, [editValue, initialValue, onSubmit, validator]);

  const handleCancel = useCallback(() => {
    setEditValue(initialValue);
    setIsEditing(false);
  }, [initialValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      } else if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleSubmit, handleCancel]
  );

  return {
    isEditing,
    editValue,
    inputRef,
    setValue: setEditValue,
    startEditing,
    handleSubmit,
    handleCancel,
    handleKeyDown,
  };
}
