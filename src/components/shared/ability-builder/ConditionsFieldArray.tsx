'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import type { AppliedCondition } from '@/lib/schemas/shared.schema';

interface ConditionsFieldArrayProps {
  value: AppliedCondition[];
  onChange: (value: AppliedCondition[]) => void;
  disabled?: boolean;
}

/**
 * Form fields for applied conditions array (condition name, escape DC)
 */
export function ConditionsFieldArray({ value, onChange, disabled }: ConditionsFieldArrayProps) {
  const [conditions, setConditions] = useState<AppliedCondition[]>(value);

  // Sync with parent
  useEffect(() => {
    setConditions(value);
  }, [value]);

  const handleAdd = () => {
    const newCondition: AppliedCondition = { name: '', dc: 10 };
    const updated = [...conditions, newCondition];
    setConditions(updated);
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = conditions.filter((_, i) => i !== index);
    setConditions(updated);
    onChange(updated);
  };

  const handleChange = (index: number, field: keyof AppliedCondition, val: string | number) => {
    const updated = [...conditions];
    if (field === 'name') {
      updated[index].name = val as string;
    } else if (field === 'dc') {
      updated[index].dc = val as number;
    }
    setConditions(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Conditions</Label>
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

      {conditions.length === 0 ? (
        <p className="text-xs text-muted-foreground">No conditions</p>
      ) : (
        <div className="space-y-2">
          {conditions.map((condition, index) => (
            <div key={index} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`condition-name-${index}`} className="text-xs">Condition</Label>
                  <Input
                    id={`condition-name-${index}`}
                    placeholder="Grappled, Charmed, etc."
                    value={condition.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    disabled={disabled}
                  />
                </div>
                <div>
                  <Label htmlFor={`condition-dc-${index}`} className="text-xs">Escape DC</Label>
                  <Input
                    id={`condition-dc-${index}`}
                    type="number"
                    value={condition.dc ?? ''}
                    onChange={(e) => handleChange(index, 'dc', parseInt(e.target.value) || 10)}
                    disabled={disabled}
                    placeholder="Optional"
                  />
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
