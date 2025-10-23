'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { ActionDTO } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ActionBuilderProps {
  onAdd: (action: ActionDTO) => void;
  maxActionsReached: boolean;
}

const ACTION_TYPES = [
  { value: 'melee_weapon_attack', label: 'Melee Weapon Attack' },
  { value: 'ranged_weapon_attack', label: 'Ranged Weapon Attack' },
  { value: 'spell_attack', label: 'Spell Attack' },
  { value: 'special', label: 'Special Action' },
];

/**
 * Form builder for creating character actions
 */
export const ActionBuilder = ({ onAdd, maxActionsReached }: ActionBuilderProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('melee_weapon_attack');
  const [attackBonus, setAttackBonus] = useState<string>('');
  const [reach, setReach] = useState('');
  const [range, setRange] = useState('');
  const [damageDice, setDamageDice] = useState('');
  const [damageBonus, setDamageBonus] = useState<string>('');
  const [damageType, setDamageType] = useState('');

  const resetForm = () => {
    setName('');
    setType('melee_weapon_attack');
    setAttackBonus('');
    setReach('');
    setRange('');
    setDamageDice('');
    setDamageBonus('');
    setDamageType('');
  };

  const handleAdd = () => {
    if (!name || !type) {
      return;
    }

    const action: ActionDTO = {
      name,
      type,
      ...(attackBonus && { attack_bonus: parseInt(attackBonus) }),
      ...(reach && { reach }),
      ...(range && { range }),
      ...(damageDice && { damage_dice: damageDice }),
      ...(damageBonus && { damage_bonus: parseInt(damageBonus) }),
      ...(damageType && { damage_type: damageType }),
    };

    onAdd(action);
    resetForm();
  };

  const showReach = type === 'melee_weapon_attack';
  const showRange = type === 'ranged_weapon_attack' || type === 'spell_attack';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add New Action</CardTitle>
        <CardDescription>Define attacks, spells, or special abilities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="action-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="action-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Longsword"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-type">
              Type <span className="text-destructive">*</span>
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="action-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((actionType) => (
                  <SelectItem key={actionType.value} value={actionType.value}>
                    {actionType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-attack-bonus">Attack Bonus</Label>
            <Input
              id="action-attack-bonus"
              type="number"
              value={attackBonus}
              onChange={(e) => setAttackBonus(e.target.value)}
              placeholder="+5"
            />
          </div>

          {showReach && (
            <div className="space-y-2">
              <Label htmlFor="action-reach">Reach</Label>
              <Input id="action-reach" value={reach} onChange={(e) => setReach(e.target.value)} placeholder="5 ft" />
            </div>
          )}

          {showRange && (
            <div className="space-y-2">
              <Label htmlFor="action-range">Range</Label>
              <Input
                id="action-range"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="30/120 ft"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="action-damage-dice">Damage Dice</Label>
            <Input
              id="action-damage-dice"
              value={damageDice}
              onChange={(e) => setDamageDice(e.target.value)}
              placeholder="1d8"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-damage-bonus">Damage Bonus</Label>
            <Input
              id="action-damage-bonus"
              type="number"
              value={damageBonus}
              onChange={(e) => setDamageBonus(e.target.value)}
              placeholder="+3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-damage-type">Damage Type</Label>
            <Input
              id="action-damage-type"
              value={damageType}
              onChange={(e) => setDamageType(e.target.value)}
              placeholder="slashing"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" onClick={handleAdd} disabled={!name || !type || maxActionsReached} variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Action
          </Button>
        </div>

        {maxActionsReached && <p className="text-sm text-destructive">Maximum 20 actions reached</p>}
      </CardContent>
    </Card>
  );
};
