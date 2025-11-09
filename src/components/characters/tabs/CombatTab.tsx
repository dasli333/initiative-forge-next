'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, X } from 'lucide-react';
import { NoCombatStatsState } from '@/components/npcs/shared/NoCombatStatsState';
import { ActionBuilder } from '@/components/characters/ActionBuilder';
import type { PlayerCharacterCombatStatsDTO } from '@/types/player-characters';
import type { ActionDTO } from '@/types';

interface CombatTabProps {
  isEditing: boolean;
  combatStats: PlayerCharacterCombatStatsDTO | null;
  editedCombatStats: {
    hp_max: number;
    armor_class: number;
    speed: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    actions_json: ActionDTO[] | null;
  } | null;
  onCombatStatsChange: (field: string, value: unknown) => void;
  onAddCombatStats: () => void;
  onRemoveCombatStats: () => void;
}

const MAX_ACTIONS = 20;

/**
 * Combat tab component for Player Character details
 * - NoCombatStatsState (when combatStats === null)
 * - OR CombatStatsForm:
 *   - Basic stats: HP Max, AC, Speed (inline editable)
 *   - Ability scores grid: STR/DEX/CON/INT/WIS/CHA
 *   - ActionsList + ActionBuilder (reuse from characters)
 *   - "Remove Combat Stats" button (destructive, confirm dialog)
 */
export function CombatTab({
  isEditing,
  combatStats,
  editedCombatStats,
  onCombatStatsChange,
  onAddCombatStats,
  onRemoveCombatStats,
}: CombatTabProps) {
  if (!combatStats && !editedCombatStats) {
    return <NoCombatStatsState onAddStats={onAddCombatStats} />;
  }

  // Use editedCombatStats when editing, combatStats when viewing
  const displayStats = isEditing && editedCombatStats ? editedCombatStats : combatStats;

  if (!displayStats) {
    return <NoCombatStatsState onAddStats={onAddCombatStats} />;
  }

  const actions = (displayStats.actions_json as ActionDTO[]) || [];

  const handleAddAction = (action: ActionDTO) => {
    if (isEditing) {
      const newActions = [...actions, action];
      onCombatStatsChange('actions_json', newActions);
    }
  };

  const handleRemoveAction = (index: number) => {
    if (isEditing) {
      const newActions = actions.filter((_, i) => i !== index);
      onCombatStatsChange('actions_json', newActions);
    }
  };

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod.toString();
  };

  return (
    <div className="space-y-6">
      {/* Basic Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="hp-max">HP Max</Label>
              <Input
                id="hp-max"
                type="number"
                value={displayStats.hp_max}
                onChange={(e) => isEditing && onCombatStatsChange('hp_max', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min={1}
                max={999}
              />
            </div>
            <div>
              <Label htmlFor="ac">Armor Class</Label>
              <Input
                id="ac"
                type="number"
                value={displayStats.armor_class}
                onChange={(e) => isEditing && onCombatStatsChange('armor_class', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min={0}
                max={30}
              />
            </div>
            <div>
              <Label htmlFor="speed">Speed</Label>
              <Input
                id="speed"
                type="number"
                value={displayStats.speed}
                onChange={(e) => isEditing && onCombatStatsChange('speed', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min={0}
                max={999}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ability Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ability Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* STR */}
            <div className="text-center space-y-2">
              <Label htmlFor="str" className="text-xs font-semibold">STR</Label>
              <Input
                id="str"
                type="number"
                value={displayStats.strength}
                onChange={(e) => isEditing && onCombatStatsChange('strength', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min={1}
                max={30}
                className="text-center"
              />
              <div className="text-xs text-muted-foreground">
                {getModifier(displayStats.strength)}
              </div>
            </div>

            {/* DEX */}
            <div className="text-center space-y-2">
              <Label htmlFor="dex" className="text-xs font-semibold">DEX</Label>
              <Input
                id="dex"
                type="number"
                value={displayStats.dexterity}
                onChange={(e) => isEditing && onCombatStatsChange('dexterity', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min={1}
                max={30}
                className="text-center"
              />
              <div className="text-xs text-muted-foreground">
                {getModifier(displayStats.dexterity)}
              </div>
            </div>

            {/* CON */}
            <div className="text-center space-y-2">
              <Label htmlFor="con" className="text-xs font-semibold">CON</Label>
              <Input
                id="con"
                type="number"
                value={displayStats.constitution}
                onChange={(e) => isEditing && onCombatStatsChange('constitution', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min={1}
                max={30}
                className="text-center"
              />
              <div className="text-xs text-muted-foreground">
                {getModifier(displayStats.constitution)}
              </div>
            </div>

            {/* INT */}
            <div className="text-center space-y-2">
              <Label htmlFor="int" className="text-xs font-semibold">INT</Label>
              <Input
                id="int"
                type="number"
                value={displayStats.intelligence}
                onChange={(e) => isEditing && onCombatStatsChange('intelligence', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min={1}
                max={30}
                className="text-center"
              />
              <div className="text-xs text-muted-foreground">
                {getModifier(displayStats.intelligence)}
              </div>
            </div>

            {/* WIS */}
            <div className="text-center space-y-2">
              <Label htmlFor="wis" className="text-xs font-semibold">WIS</Label>
              <Input
                id="wis"
                type="number"
                value={displayStats.wisdom}
                onChange={(e) => isEditing && onCombatStatsChange('wisdom', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min={1}
                max={30}
                className="text-center"
              />
              <div className="text-xs text-muted-foreground">
                {getModifier(displayStats.wisdom)}
              </div>
            </div>

            {/* CHA */}
            <div className="text-center space-y-2">
              <Label htmlFor="cha" className="text-xs font-semibold">CHA</Label>
              <Input
                id="cha"
                type="number"
                value={displayStats.charisma}
                onChange={(e) => isEditing && onCombatStatsChange('charisma', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min={1}
                max={30}
                className="text-center"
              />
              <div className="text-xs text-muted-foreground">
                {getModifier(displayStats.charisma)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
          <CardDescription>
            {actions.length} / {MAX_ACTIONS} actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Actions List */}
          {actions.length > 0 && (
            <div className="space-y-2">
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{action.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {action.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    {action.attack_bonus !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        Attack: {action.attack_bonus >= 0 ? '+' : ''}{action.attack_bonus}
                      </p>
                    )}
                    {action.damage_dice && (
                      <p className="text-xs text-muted-foreground">
                        Damage: {action.damage_dice}
                        {action.damage_bonus ? ` + ${action.damage_bonus}` : ''}
                        {action.damage_type ? ` ${action.damage_type}` : ''}
                      </p>
                    )}
                    {action.reach && (
                      <p className="text-xs text-muted-foreground">Reach: {action.reach}</p>
                    )}
                    {action.range && (
                      <p className="text-xs text-muted-foreground">Range: {action.range}</p>
                    )}
                    {action.description && (
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveAction(index)}
                    disabled={!isEditing}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Action Builder */}
          {isEditing && (
            <ActionBuilder
              onAdd={handleAddAction}
              maxActionsReached={actions.length >= MAX_ACTIONS}
            />
          )}
        </CardContent>
      </Card>

      {/* Remove Combat Stats Button */}
      {isEditing && (
        <div className="flex items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Combat Stats
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Combat Stats</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove all combat statistics? This will
                  delete HP, AC, ability scores, and all actions. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onRemoveCombatStats}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remove Stats
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
