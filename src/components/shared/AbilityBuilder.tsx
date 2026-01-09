'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { AttackRollFields, DamageFieldArray, SavingThrowFields, ConditionsFieldArray } from './ability-builder';
import type { MonsterAction, MonsterTrait } from '@/lib/schemas/monster.schema';
import type { AttackRoll, Damage, SavingThrow, AppliedCondition } from '@/lib/schemas/shared.schema';

interface AbilityBuilderProps {
  abilityType: 'action' | 'trait' | 'bonus_action' | 'reaction' | 'legendary_action';
  onAdd: (ability: MonsterAction | MonsterTrait) => void;
  maxReached?: boolean;
}

/**
 * AbilityBuilder component for creating monster abilities
 * - Mode-dependent field visibility
 * - Actions: all fields (attack, damage, save, conditions, healing)
 * - Traits: name, description, type, save, damage only
 */
export function AbilityBuilder({ abilityType, onAdd, maxReached = false }: AbilityBuilderProps) {
  const isTrait = abilityType === 'trait';
  const isAction = !isTrait;

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('special');
  const [attackRoll, setAttackRoll] = useState<AttackRoll | undefined>(undefined);
  const [damage, setDamage] = useState<Damage[]>([]);
  const [savingThrow, setSavingThrow] = useState<SavingThrow | undefined>(undefined);
  const [conditions, setConditions] = useState<AppliedCondition[]>([]);
  const [healingFormula, setHealingFormula] = useState('');
  const [healingAverage, setHealingAverage] = useState(0);

  const handleAdd = () => {
    if (!name.trim()) return;

    if (isTrait) {
      const trait: MonsterTrait = {
        name: name.trim(),
        description: description.trim(),
        type,
        ...(savingThrow && { savingThrow }),
        ...(damage.length > 0 && { damage }),
      };
      onAdd(trait);
    } else {
      const action: MonsterAction = {
        name: name.trim(),
        description: description.trim(),
        type,
        ...(attackRoll && { attackRoll }),
        ...(damage.length > 0 && { damage }),
        ...(savingThrow && { savingThrow }),
        ...(conditions.length > 0 && { conditions }),
        ...(healingFormula && {
          healing: {
            formula: healingFormula,
            average: healingAverage,
          },
        }),
      };
      onAdd(action);
    }

    // Reset form
    setName('');
    setDescription('');
    setType('special');
    setAttackRoll(undefined);
    setDamage([]);
    setSavingThrow(undefined);
    setConditions([]);
    setHealingFormula('');
    setHealingAverage(0);
  };

  const getTitle = () => {
    switch (abilityType) {
      case 'action':
        return 'Add Action';
      case 'trait':
        return 'Add Trait';
      case 'bonus_action':
        return 'Add Bonus Action';
      case 'reaction':
        return 'Add Reaction';
      case 'legendary_action':
        return 'Add Legendary Action';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{getTitle()}</CardTitle>
        {maxReached && (
          <CardDescription className="text-xs text-destructive">
            Maximum limit reached
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="ability-name">Name</Label>
          <Input
            id="ability-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ability name"
            disabled={maxReached}
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="ability-desc">Description</Label>
          <Textarea
            id="ability-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ability description"
            rows={3}
            disabled={maxReached}
          />
        </div>

        {/*disabled for now as it seems not needed - dw*/}
        {/*/!* Type *!/*/}
        {/*<div>*/}
        {/*  <Label htmlFor="ability-type">Type</Label>*/}
        {/*  <Input*/}
        {/*    id="ability-type"*/}
        {/*    value={type}*/}
        {/*    onChange={(e) => setType(e.target.value)}*/}
        {/*    placeholder="special, melee, ranged, etc."*/}
        {/*    disabled={maxReached}*/}
        {/*  />*/}
        {/*</div>*/}

        {/* Attack Roll (Actions only) */}
        {isAction && (
          <AttackRollFields
            value={attackRoll}
            onChange={setAttackRoll}
            disabled={maxReached}
          />
        )}

        {/* Damage */}
        <DamageFieldArray
          value={damage}
          onChange={setDamage}
          disabled={maxReached}
        />

        {/* Saving Throw */}
        <SavingThrowFields
          value={savingThrow}
          onChange={setSavingThrow}
          disabled={maxReached}
        />

        {/* Conditions (Actions only) */}
        {isAction && (
          <ConditionsFieldArray
            value={conditions}
            onChange={setConditions}
            disabled={maxReached}
          />
        )}

        {/* Healing (Actions only) */}
        {isAction && (
          <div className="space-y-2">
            <Label>Healing</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="healing-formula" className="text-xs">Formula</Label>
                <Input
                  id="healing-formula"
                  value={healingFormula}
                  onChange={(e) => {
                    setHealingFormula(e.target.value);
                    // Auto-calculate average
                    const match = e.target.value.match(/^(\d+)d(\d+)(?:\s*\+\s*(\d+))?$/);
                    if (match) {
                      const [, numDice, diceSize, bonus] = match;
                      const avgPerDie = (parseInt(diceSize) + 1) / 2;
                      const total = parseInt(numDice) * avgPerDie + (parseInt(bonus || '0'));
                      setHealingAverage(Math.floor(total));
                    }
                  }}
                  placeholder="2d8+5"
                  disabled={maxReached}
                />
              </div>
              <div>
                <Label htmlFor="healing-avg" className="text-xs">Average</Label>
                <Input
                  id="healing-avg"
                  type="number"
                  value={healingAverage}
                  onChange={(e) => setHealingAverage(parseInt(e.target.value) || 0)}
                  disabled={maxReached}
                />
              </div>
            </div>
          </div>
        )}

        {/* Add Button */}
        <Button
          onClick={handleAdd}
          disabled={maxReached || !name.trim()}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {isTrait ? 'Trait' : 'Ability'}
        </Button>
      </CardContent>
    </Card>
  );
}
