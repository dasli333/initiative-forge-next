'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Swords, Trash2, X } from 'lucide-react';
import { NoCombatStatsState } from '../shared/NoCombatStatsState';
import { ActionBuilder } from '@/components/characters/ActionBuilder';
import type { NPCDetailsViewModel } from '@/types/npcs';
import type { UpsertNPCCombatStatsCommand } from '@/types/npc-combat-stats';
import type { ActionDTO } from '@/types';

interface CombatTabProps {
  viewModel: NPCDetailsViewModel;
  campaignId: string;
  onAddStats: () => void;
  onUpdateStats: (command: UpsertNPCCombatStatsCommand) => void;
  onRemoveStats: () => void;
  isUpdating?: boolean;
}

const MAX_ACTIONS = 20;

/**
 * Combat tab component for NPC details
 * - NoCombatStatsState (when combatStats === null)
 * - OR CombatStatsForm:
 *   - Basic stats: HP Max, AC, Speed (inline editable)
 *   - Ability scores grid: STR/DEX/CON/INT/WIS/CHA
 *   - ActionsList + ActionBuilder (reuse from characters)
 *   - "Use in Combat" button → redirect `/campaigns/[id]/combats/new`
 *   - "Remove Combat Stats" button (destructive, confirm dialog)
 */
export function CombatTab({
  viewModel,
  campaignId,
  onAddStats,
  onUpdateStats,
  onRemoveStats,
  isUpdating = false,
}: CombatTabProps) {
  const { npc, combatStats } = viewModel;
  const router = useRouter();

  // Local state for form fields
  const [hpMax, setHpMax] = useState(combatStats?.hp_max?.toString() || '');
  const [ac, setAc] = useState(combatStats?.armor_class?.toString() || '');
  const [speed, setSpeed] = useState(combatStats?.speed?.toString() || '');
  const [str, setStr] = useState(combatStats?.strength?.toString() || '');
  const [dex, setDex] = useState(combatStats?.dexterity?.toString() || '');
  const [con, setCon] = useState(combatStats?.constitution?.toString() || '');
  const [int, setInt] = useState(combatStats?.intelligence?.toString() || '');
  const [wis, setWis] = useState(combatStats?.wisdom?.toString() || '');
  const [cha, setCha] = useState(combatStats?.charisma?.toString() || '');
  const [actions, setActions] = useState<ActionDTO[]>(
    (combatStats?.actions_json as ActionDTO[]) || []
  );

  if (!combatStats) {
    return <NoCombatStatsState onAddStats={onAddStats} />;
  }

  const handleFieldBlur = (field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    onUpdateStats({ [field]: numValue } as unknown as UpsertNPCCombatStatsCommand);
  };

  const handleAddAction = (action: ActionDTO) => {
    const newActions = [...actions, action];
    setActions(newActions);
    onUpdateStats({ actions_json: newActions as any } as unknown as UpsertNPCCombatStatsCommand);
  };

  const handleRemoveAction = (index: number) => {
    const newActions = actions.filter((_, i) => i !== index);
    setActions(newActions);
    onUpdateStats({ actions_json: newActions as any } as unknown as UpsertNPCCombatStatsCommand);
  };

  const handleUseInCombat = () => {
    router.push(`/campaigns/${campaignId}/combats/new`);
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
                value={hpMax}
                onChange={(e) => setHpMax(e.target.value)}
                onBlur={() => handleFieldBlur('hp_max', hpMax)}
                disabled={isUpdating}
                min={1}
                max={999}
              />
            </div>
            <div>
              <Label htmlFor="ac">Armor Class</Label>
              <Input
                id="ac"
                type="number"
                value={ac}
                onChange={(e) => setAc(e.target.value)}
                onBlur={() => handleFieldBlur('armor_class', ac)}
                disabled={isUpdating}
                min={0}
                max={30}
              />
            </div>
            <div>
              <Label htmlFor="speed">Speed</Label>
              <Input
                id="speed"
                type="number"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                onBlur={() => handleFieldBlur('speed', speed)}
                disabled={isUpdating}
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
                value={str}
                onChange={(e) => setStr(e.target.value)}
                onBlur={() => handleFieldBlur('strength', str)}
                disabled={isUpdating}
                min={1}
                max={30}
                className="text-center"
              />
              <div className="text-xs text-muted-foreground">
                {getModifier(parseInt(str) || 10)}
              </div>
            </div>

            {/* DEX */}
            <div className="text-center space-y-2">
              <Label htmlFor="dex" className="text-xs font-semibold">DEX</Label>
              <Input
                id="dex"
                type="number"
                value={dex}
                onChange={(e) => setDex(e.target.value)}
                onBlur={() => handleFieldBlur('dexterity', dex)}
                disabled={isUpdating}
                min={1}
                max={30}
                className="text-center"
              />
              <div className="text-xs text-muted-foreground">
                {getModifier(parseInt(dex) || 10)}
              </div>
            </div>

            {/* CON */}
            <div className="text-center space-y-2">
              <Label htmlFor="con" className="text-xs font-semibold">CON</Label>
              <Input
                id="con"
                type="number"
                value={con}
                onChange={(e) => setCon(e.target.value)}
                onBlur={() => handleFieldBlur('constitution', con)}
                disabled={isUpdating}
                min={1}
                max={30}
                className="text-center"
              />
              <div className="text-xs text-muted-foreground">
                {getModifier(parseInt(con) || 10)}
              </div>
            </div>

            {/* INT */}
            <div className="text-center space-y-2">
              <Label htmlFor="int" className="text-xs font-semibold">INT</Label>
              <Input
                id="int"
                type="number"
                value={int}
                onChange={(e) => setInt(e.target.value)}
                onBlur={() => handleFieldBlur('intelligence', int)}
                disabled={isUpdating}
                min={1}
                max={30}
                className="text-center"
              />
              <div className="text-xs text-muted-foreground">
                {getModifier(parseInt(int) || 10)}
              </div>
            </div>

            {/* WIS */}
            <div className="text-center space-y-2">
              <Label htmlFor="wis" className="text-xs font-semibold">WIS</Label>
              <Input
                id="wis"
                type="number"
                value={wis}
                onChange={(e) => setWis(e.target.value)}
                onBlur={() => handleFieldBlur('wisdom', wis)}
                disabled={isUpdating}
                min={1}
                max={30}
                className="text-center"
              />
              <div className="text-xs text-muted-foreground">
                {getModifier(parseInt(wis) || 10)}
              </div>
            </div>

            {/* CHA */}
            <div className="text-center space-y-2">
              <Label htmlFor="cha" className="text-xs font-semibold">CHA</Label>
              <Input
                id="cha"
                type="number"
                value={cha}
                onChange={(e) => setCha(e.target.value)}
                onBlur={() => handleFieldBlur('charisma', cha)}
                disabled={isUpdating}
                min={1}
                max={30}
                className="text-center"
              />
              <div className="text-xs text-muted-foreground">
                {getModifier(parseInt(cha) || 10)}
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
                    disabled={isUpdating}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Action Builder */}
          <ActionBuilder
            onAdd={handleAddAction}
            maxActionsReached={actions.length >= MAX_ACTIONS}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleUseInCombat}
          variant="default"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Swords className="h-4 w-4 mr-2" />
          Use in Combat
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isUpdating}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Combat Stats
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Combat Stats</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove all combat statistics for {npc.name}? This will
                delete HP, AC, ability scores, and all actions. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onRemoveStats}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove Stats
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
