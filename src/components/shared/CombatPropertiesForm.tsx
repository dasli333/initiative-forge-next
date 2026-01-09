'use client';

import { useState, KeyboardEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { DAMAGE_TYPES, CONDITION_TYPES } from '@/lib/constants/game-data';

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  disabled?: boolean;
}

/**
 * Tag input field for arrays of strings (constrained to suggestions)
 */
function TagInput({ label, value, onChange, placeholder, suggestions = [], disabled }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const trimmed = inputValue.trim();

      // If suggestions exist, only allow values from suggestions
      if (suggestions.length > 0) {
        const matchingSuggestion = suggestions.find(
          (s) => s.toLowerCase() === trimmed.toLowerCase()
        );
        if (matchingSuggestion && !value.includes(matchingSuggestion)) {
          onChange([...value, matchingSuggestion]);
        }
      } else {
        // No suggestions = allow free-text (for gear)
        if (!value.includes(trimmed)) {
          onChange([...value, trimmed]);
        }
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex flex-wrap gap-2 p-2 border rounded-lg bg-muted/30 min-h-[42px]">
        {value.map((tag, index) => (
          <Badge key={index} variant="secondary" className="gap-1">
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 min-w-[120px] border-0 p-0 h-6 bg-transparent focus-visible:ring-0"
        />
      </div>
      {suggestions.length > 0 && !disabled && (
        <div className="mt-1 flex flex-wrap gap-1">
          {suggestions
            .filter((s) => !value.includes(s))
            .filter((s) => !inputValue || s.toLowerCase().includes(inputValue.toLowerCase()))
            .map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  if (!value.includes(suggestion)) {
                    onChange([...value, suggestion]);
                    setInputValue('');
                  }
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                + {suggestion}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

interface CombatPropertiesFormProps {
  damageVulnerabilities: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  gear: string[];
  onChange: (field: string, value: string[]) => void;
  disabled?: boolean;
}

/**
 * Combat properties form with tag inputs
 * - Damage vulnerabilities, resistances, immunities
 * - Condition immunities
 * - Gear (free-text tags)
 */
export function CombatPropertiesForm({
  damageVulnerabilities,
  damageResistances,
  damageImmunities,
  conditionImmunities,
  gear,
  onChange,
  disabled = false,
}: CombatPropertiesFormProps) {
  return (
    <div className="space-y-4">
      <TagInput
        label="Damage Vulnerabilities"
        value={damageVulnerabilities}
        onChange={(v) => onChange('damage_vulnerabilities', v)}
        placeholder="Add damage type..."
        suggestions={DAMAGE_TYPES as unknown as string[]}
        disabled={disabled}
      />

      <TagInput
        label="Damage Resistances"
        value={damageResistances}
        onChange={(v) => onChange('damage_resistances', v)}
        placeholder="Add damage type..."
        suggestions={DAMAGE_TYPES as unknown as string[]}
        disabled={disabled}
      />

      <TagInput
        label="Damage Immunities"
        value={damageImmunities}
        onChange={(v) => onChange('damage_immunities', v)}
        placeholder="Add damage type..."
        suggestions={DAMAGE_TYPES as unknown as string[]}
        disabled={disabled}
      />

      <TagInput
        label="Condition Immunities"
        value={conditionImmunities}
        onChange={(v) => onChange('condition_immunities', v)}
        placeholder="Add condition..."
        suggestions={CONDITION_TYPES as unknown as string[]}
        disabled={disabled}
      />

      <TagInput
        label="Gear"
        value={gear}
        onChange={(v) => onChange('gear', v)}
        placeholder="Add gear/equipment..."
        disabled={disabled}
      />
    </div>
  );
}
