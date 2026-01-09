'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { MonsterAction, MonsterTrait } from '@/lib/schemas/monster.schema';

interface AbilityCardProps {
  ability: MonsterAction | MonsterTrait;
  onDelete?: () => void;
  editMode?: boolean;
}

/**
 * Display/edit card for existing abilities
 * - Name, type badge, description
 * - Attack bonus, damage summary
 * - Delete button (in edit mode)
 */
export function AbilityCard({ ability, onDelete, editMode = false }: AbilityCardProps) {
  const isAction = 'attackRoll' in ability || 'healing' in ability;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{ability.name}</span>
          <Badge variant="secondary" className="text-xs">
            {ability.type}
          </Badge>
        </div>

        {/* Description */}
        {ability.description && (
          <p className="text-sm text-muted-foreground">{ability.description}</p>
        )}

        {/* Attack Roll (Actions only) */}
        {isAction && 'attackRoll' in ability && ability.attackRoll && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Attack:</span> {ability.attackRoll.type} {ability.attackRoll.bonus >= 0 ? '+' : ''}
            {ability.attackRoll.bonus}
          </p>
        )}

        {/* Damage */}
        {ability.damage && ability.damage.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Damage:</span>{' '}
            {ability.damage
              .map((d) => `${d.average} (${d.formula})${d.type ? ` ${d.type}` : ''}`)
              .join(' + ')}
          </p>
        )}

        {/* Saving Throw */}
        {ability.savingThrow && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Save:</span> {ability.savingThrow.ability} DC {ability.savingThrow.dc}
            {ability.savingThrow.success ? ` (${ability.savingThrow.success})` : ''}
          </p>
        )}

        {/* Conditions (Actions only) */}
        {isAction && 'conditions' in ability && ability.conditions && ability.conditions.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Conditions:</span>{' '}
            {ability.conditions.map((c) => `${c.name}${c.dc ? ` (DC ${c.dc})` : ''}`).join(', ')}
          </p>
        )}

        {/* Healing (Actions only) */}
        {isAction && 'healing' in ability && ability.healing && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Healing:</span> {ability.healing.average} ({ability.healing.formula})
          </p>
        )}
      </div>

      {/* Delete Button */}
      {editMode && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
