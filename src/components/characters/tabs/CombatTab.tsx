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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
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

  const getModifierColor = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    if (mod > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (mod < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Combat Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Combat Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[auto_1fr] gap-8 items-start">
            {/* Basic Stats - Left Column */}
            <div className="space-y-4 min-w-[180px]">
              <div>
                <Label htmlFor="hp-max">HP Max</Label>
                <Input
                  id="hp-max"
                  data-testid="character-max-hp-input"
                  type="number"
                  value={displayStats.hp_max}
                  onChange={(e) => isEditing && onCombatStatsChange('hp_max', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  min={1}
                  max={999}
                  className="max-w-[120px] text-center"
                />
              </div>
              <div>
                <Label htmlFor="ac">Armor Class</Label>
                <Input
                  id="ac"
                  data-testid="character-ac-input"
                  type="number"
                  value={displayStats.armor_class}
                  onChange={(e) => isEditing && onCombatStatsChange('armor_class', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  min={0}
                  max={30}
                  className="max-w-[120px] text-center"
                />
              </div>
            </div>

            {/* Ability Scores Table - Right Column */}
            <div className="max-w-2xl">
              <div className="rounded-lg overflow-hidden border border-border/50">
                <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-center font-semibold">STR</TableHead>
                  <TableHead className="text-center font-semibold">DEX</TableHead>
                  <TableHead className="text-center font-semibold">CON</TableHead>
                  <TableHead className="text-center font-semibold">INT</TableHead>
                  <TableHead className="text-center font-semibold">WIS</TableHead>
                  <TableHead className="text-center font-semibold">CHA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-muted/30 transition-colors">
                  {/* STR */}
                  <TableCell className="text-center">
                    <Input
                      id="str"
                      data-testid="character-str-input"
                      type="number"
                      value={displayStats.strength}
                      onChange={(e) => isEditing && onCombatStatsChange('strength', parseInt(e.target.value) || 0)}
                      disabled={!isEditing}
                      min={1}
                      max={30}
                      className="text-center max-w-[70px] mx-auto mb-1"
                    />
                    <div className={cn("text-xs font-medium", getModifierColor(displayStats.strength))}>
                      ({getModifier(displayStats.strength)})
                    </div>
                  </TableCell>

                  {/* DEX */}
                  <TableCell className="text-center">
                    <Input
                      id="dex"
                      data-testid="character-dex-input"
                      type="number"
                      value={displayStats.dexterity}
                      onChange={(e) => isEditing && onCombatStatsChange('dexterity', parseInt(e.target.value) || 0)}
                      disabled={!isEditing}
                      min={1}
                      max={30}
                      className="text-center max-w-[70px] mx-auto mb-1"
                    />
                    <div className={cn("text-xs font-medium", getModifierColor(displayStats.dexterity))}>
                      ({getModifier(displayStats.dexterity)})
                    </div>
                  </TableCell>

                  {/* CON */}
                  <TableCell className="text-center">
                    <Input
                      id="con"
                      data-testid="character-con-input"
                      type="number"
                      value={displayStats.constitution}
                      onChange={(e) => isEditing && onCombatStatsChange('constitution', parseInt(e.target.value) || 0)}
                      disabled={!isEditing}
                      min={1}
                      max={30}
                      className="text-center max-w-[70px] mx-auto mb-1"
                    />
                    <div className={cn("text-xs font-medium", getModifierColor(displayStats.constitution))}>
                      ({getModifier(displayStats.constitution)})
                    </div>
                  </TableCell>

                  {/* INT */}
                  <TableCell className="text-center">
                    <Input
                      id="int"
                      data-testid="character-int-input"
                      type="number"
                      value={displayStats.intelligence}
                      onChange={(e) => isEditing && onCombatStatsChange('intelligence', parseInt(e.target.value) || 0)}
                      disabled={!isEditing}
                      min={1}
                      max={30}
                      className="text-center max-w-[70px] mx-auto mb-1"
                    />
                    <div className={cn("text-xs font-medium", getModifierColor(displayStats.intelligence))}>
                      ({getModifier(displayStats.intelligence)})
                    </div>
                  </TableCell>

                  {/* WIS */}
                  <TableCell className="text-center">
                    <Input
                      id="wis"
                      data-testid="character-wis-input"
                      type="number"
                      value={displayStats.wisdom}
                      onChange={(e) => isEditing && onCombatStatsChange('wisdom', parseInt(e.target.value) || 0)}
                      disabled={!isEditing}
                      min={1}
                      max={30}
                      className="text-center max-w-[70px] mx-auto mb-1"
                    />
                    <div className={cn("text-xs font-medium", getModifierColor(displayStats.wisdom))}>
                      ({getModifier(displayStats.wisdom)})
                    </div>
                  </TableCell>

                  {/* CHA */}
                  <TableCell className="text-center">
                    <Input
                      id="cha"
                      data-testid="character-cha-input"
                      type="number"
                      value={displayStats.charisma}
                      onChange={(e) => isEditing && onCombatStatsChange('charisma', parseInt(e.target.value) || 0)}
                      disabled={!isEditing}
                      min={1}
                      max={30}
                      className="text-center max-w-[70px] mx-auto mb-1"
                    />
                    <div className={cn("text-xs font-medium", getModifierColor(displayStats.charisma))}>
                      ({getModifier(displayStats.charisma)})
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
        <CardContent className="max-w-4xl space-y-4">
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
