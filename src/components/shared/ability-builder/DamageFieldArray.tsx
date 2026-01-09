'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import type { Damage } from '@/lib/schemas/shared.schema';
import { DAMAGE_TYPES } from '@/lib/constants/game-data';

interface DamageFieldArrayProps {
  value: Damage[];
  onChange: (value: Damage[]) => void;
  disabled?: boolean;
}

/**
 * Calculates average from dice formula (e.g., "2d6+3" -> 10)
 */
function calculateAverage(formula: string): number {
  const match = formula.match(/^(\d+)d(\d+)(?:\s*\+\s*(\d+))?$/);
  if (!match) return 0;

  const [, numDice, diceSize, bonus] = match;
  const avgPerDie = (parseInt(diceSize) + 1) / 2;
  const total = parseInt(numDice) * avgPerDie + (parseInt(bonus || '0'));
  return Math.floor(total);
}

/**
 * Form fields for damage array (formula, auto-avg, type)
 */
export function DamageFieldArray({ value, onChange, disabled }: DamageFieldArrayProps) {
  const [damageEntries, setDamageEntries] = useState<Damage[]>(value);

  // Sync with parent
  useEffect(() => {
    setDamageEntries(value);
  }, [value]);

  const handleAdd = () => {
    const newEntry: Damage = { formula: '1d6', average: 3, type: DAMAGE_TYPES[1] }; // Bludgeoning
    const updated = [...damageEntries, newEntry];
    setDamageEntries(updated);
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = damageEntries.filter((_, i) => i !== index);
    setDamageEntries(updated);
    onChange(updated);
  };

  const handleChange = (index: number, field: keyof Damage, val: string | number) => {
    const updated = [...damageEntries];

    if (field === 'formula') {
      updated[index].formula = val as string;
      // Auto-calculate average
      updated[index].average = calculateAverage(val as string);
    } else if (field === 'type') {
      updated[index].type = val as string;
    } else if (field === 'average') {
      updated[index].average = val as number;
    }

    setDamageEntries(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Damage</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAdd}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {damageEntries.length === 0 ? (
        <p className="text-xs text-muted-foreground">No damage entries</p>
      ) : (
        <div className="space-y-2">
          {damageEntries.map((entry, index) => (
            <div key={index} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor={`damage-formula-${index}`} className="text-xs">Formula</Label>
                  <Input
                    id={`damage-formula-${index}`}
                    placeholder="2d6+3"
                    value={entry.formula}
                    onChange={(e) => handleChange(index, 'formula', e.target.value)}
                    disabled={disabled}
                  />
                </div>
                <div>
                  <Label htmlFor={`damage-avg-${index}`} className="text-xs">Average</Label>
                  <Input
                    id={`damage-avg-${index}`}
                    type="number"
                    value={entry.average}
                    onChange={(e) => handleChange(index, 'average', parseInt(e.target.value) || 0)}
                    disabled={disabled}
                  />
                </div>
                <div>
                  <Label htmlFor={`damage-type-${index}`} className="text-xs">Type</Label>
                  <Select
                    value={entry.type || ''}
                    onValueChange={(v) => handleChange(index, 'type', v)}
                    disabled={disabled}
                  >
                    <SelectTrigger id={`damage-type-${index}`}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAMAGE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="mt-5"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
