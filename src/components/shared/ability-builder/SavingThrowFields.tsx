'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SavingThrow } from '@/lib/schemas/shared.schema';
import { ABILITIES, SAVING_THROW_SUCCESS_OUTCOMES } from '@/lib/constants/game-data';

interface SavingThrowFieldsProps {
  value: SavingThrow | undefined;
  onChange: (value: SavingThrow | undefined) => void;
  disabled?: boolean;
}

/**
 * Form fields for saving throw (ability, DC, success outcome)
 */
export function SavingThrowFields({ value, onChange, disabled }: SavingThrowFieldsProps) {
  const handleAdd = () => {
    onChange({
      ability: 'Dexterity',
      dc: 10,
      success: 'negates',
    });
  };

  const handleClear = () => {
    onChange(undefined);
  };

  const handleChange = (field: keyof SavingThrow, val: string | number) => {
    if (!value) return;
    onChange({
      ...value,
      [field]: val,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Saving Throw</Label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      {!value ? (
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          + Add saving throw
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2 p-3 border rounded-lg bg-muted/30">
          <div>
            <Label htmlFor="save-ability" className="text-xs">Ability</Label>
            <Select
              value={value.ability}
              onValueChange={(v) => handleChange('ability', v)}
              disabled={disabled}
            >
              <SelectTrigger id="save-ability">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ABILITIES.map((ability) => (
                  <SelectItem key={ability} value={ability}>
                    {ability}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="save-dc" className="text-xs">DC</Label>
            <Input
              id="save-dc"
              type="number"
              value={value.dc ?? 10}
              onChange={(e) => handleChange('dc', parseInt(e.target.value) || 10)}
              disabled={disabled}
            />
          </div>
          <div>
            <Label htmlFor="save-success" className="text-xs">Success</Label>
            <Select
              value={value.success ?? 'negates'}
              onValueChange={(v) => handleChange('success', v)}
              disabled={disabled}
            >
              <SelectTrigger id="save-success">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAVING_THROW_SUCCESS_OUTCOMES.map((outcome) => (
                  <SelectItem key={outcome} value={outcome}>
                    {outcome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
