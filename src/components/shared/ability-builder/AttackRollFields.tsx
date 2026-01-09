'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { AttackRoll } from '@/lib/schemas/shared.schema';

interface AttackRollFieldsProps {
  value: AttackRoll | undefined;
  onChange: (value: AttackRoll | undefined) => void;
  disabled?: boolean;
}

/**
 * Form fields for attack roll (melee/ranged toggle + bonus)
 */
export function AttackRollFields({ value, onChange, disabled }: AttackRollFieldsProps) {
  const handleTypeChange = (type: 'melee' | 'ranged') => {
    onChange({
      type,
      bonus: value?.bonus ?? 0,
    });
  };

  const handleBonusChange = (bonus: number) => {
    if (!value) return;
    onChange({
      ...value,
      bonus,
    });
  };

  const handleClear = () => {
    onChange(undefined);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Attack Roll</Label>
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
          onClick={() => handleTypeChange('melee')}
          disabled={disabled}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          + Add attack roll
        </button>
      ) : (
        <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
          <div>
            <Label className="text-xs">Type</Label>
            <RadioGroup
              value={value.type}
              onValueChange={(v) => handleTypeChange(v as 'melee' | 'ranged')}
              disabled={disabled}
              className="flex gap-4 mt-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="melee" id="melee" />
                <Label htmlFor="melee" className="font-normal cursor-pointer">Melee</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ranged" id="ranged" />
                <Label htmlFor="ranged" className="font-normal cursor-pointer">Ranged</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="attack-bonus" className="text-xs">Bonus</Label>
            <Input
              id="attack-bonus"
              type="number"
              value={value.bonus}
              onChange={(e) => handleBonusChange(parseInt(e.target.value) || 0)}
              disabled={disabled}
              className="max-w-[120px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
