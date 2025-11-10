'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';

const STANDARD_LANGUAGES = [
  'Common',
  'Dwarvish',
  'Elvish',
  'Giant',
  'Gnomish',
  'Goblin',
  'Halfling',
  'Orc',
];

const EXOTIC_LANGUAGES = [
  'Abyssal',
  'Celestial',
  'Draconic',
  'Deep Speech',
  'Infernal',
  'Primordial',
  'Sylvan',
  'Undercommon',
];

interface LanguageSelectorProps {
  value: string[];
  onChange: (languages: string[]) => void;
  disabled?: boolean;
  maxLanguages?: number;
}

/**
 * Language selector with predefined options + custom input
 * - Multiselect from standard + exotic D&D languages
 * - Add custom languages via input
 * - Display as badges with remove button
 */
export function LanguageSelector({
  value = [],
  onChange,
  disabled = false,
  maxLanguages = 20,
}: LanguageSelectorProps) {
  const [customInput, setCustomInput] = useState('');
  const [showExotic, setShowExotic] = useState(false);

  const toggleLanguage = (language: string) => {
    if (value.includes(language)) {
      onChange(value.filter((l) => l !== language));
    } else {
      if (value.length >= maxLanguages) {
        return; // Max reached
      }
      onChange([...value, language]);
    }
  };

  const addCustomLanguage = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    if (value.length >= maxLanguages) return;

    onChange([...value, trimmed]);
    setCustomInput('');
  };

  const removeLanguage = (language: string) => {
    onChange(value.filter((l) => l !== language));
  };

  const isMaxReached = value.length >= maxLanguages;

  return (
    <div className="space-y-3">
      {/* Selected languages */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((language) => (
            <Badge
              key={language}
              variant="secondary"
              className="text-xs gap-1 pr-1"
            >
              {language}
              <button
                type="button"
                onClick={() => removeLanguage(language)}
                disabled={disabled}
                className="hover:bg-destructive/20 rounded-sm p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Standard languages */}
      <div>
        <Label className="text-xs text-muted-foreground">Standard Languages</Label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {STANDARD_LANGUAGES.map((language) => {
            const isSelected = value.includes(language);
            return (
              <button
                key={language}
                type="button"
                onClick={() => toggleLanguage(language)}
                disabled={disabled || (isMaxReached && !isSelected)}
                className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-input hover:bg-accent hover:text-accent-foreground'
                } ${disabled || (isMaxReached && !isSelected) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {language}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exotic languages (toggle) */}
      <div>
        <button
          type="button"
          onClick={() => setShowExotic(!showExotic)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showExotic ? '− Hide' : '+ Show'} Exotic Languages
        </button>
        {showExotic && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {EXOTIC_LANGUAGES.map((language) => {
              const isSelected = value.includes(language);
              return (
                <button
                  key={language}
                  type="button"
                  onClick={() => toggleLanguage(language)}
                  disabled={disabled || (isMaxReached && !isSelected)}
                  className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-input hover:bg-accent hover:text-accent-foreground'
                  } ${disabled || (isMaxReached && !isSelected) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {language}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom language input */}
      <div>
        <Label className="text-xs text-muted-foreground">Custom Language</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomLanguage();
              }
            }}
            placeholder="e.g., Thieves' Cant"
            disabled={disabled || isMaxReached}
            className="h-8 text-sm"
            maxLength={50}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustomLanguage}
            disabled={disabled || isMaxReached || !customInput.trim()}
            className="h-8 px-2"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Max languages hint */}
      <p className="text-xs text-muted-foreground">
        {value.length}/{maxLanguages} languages selected
        {isMaxReached && ' (maximum reached)'}
      </p>
    </div>
  );
}
