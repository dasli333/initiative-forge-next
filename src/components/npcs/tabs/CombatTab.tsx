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
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NoCombatStatsState } from '../shared/NoCombatStatsState';
import { AbilityBuilder } from '@/components/shared/AbilityBuilder';
import { AbilityCard } from '@/components/shared/AbilityCard';
import { CombatPropertiesForm } from '@/components/shared/CombatPropertiesForm';
import type { NPCDTO } from '@/types/npcs';
import type { NPCCombatStatsDTO } from '@/types/npc-combat-stats';
import type { MonsterAction, MonsterTrait, LegendaryActions } from '@/lib/schemas/monster.schema';

interface CombatTabProps {
  npc: NPCDTO;
  combatStats?: NPCCombatStatsDTO | null;
  campaignId: string;
  isEditing: boolean;
  editedCombatStats: {
    hp_max: number;
    armor_class: number;
    speed: string[];
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    actions_json: MonsterAction[] | null;
    traits_json: MonsterTrait[] | null;
    bonus_actions_json: MonsterAction[] | null;
    reactions_json: MonsterAction[] | null;
    legendary_actions_json: LegendaryActions | null;
    damage_vulnerabilities: string[] | null;
    damage_resistances: string[] | null;
    damage_immunities: string[] | null;
    condition_immunities: string[] | null;
    gear: string[] | null;
  } | null;
  onCombatStatsChange: (field: string, value: unknown) => void;
  onAddStats: () => void;
  onRemoveStats: () => void;
  isUpdating?: boolean;
}

const MAX_ABILITIES = 20;

/**
 * Combat tab component for NPC details
 */
export function CombatTab({
  npc,
  combatStats,
  campaignId: _campaignId,
  isEditing,
  editedCombatStats,
  onCombatStatsChange,
  onAddStats,
  onRemoveStats,
  isUpdating = false,
}: CombatTabProps) {
  if (!combatStats && !editedCombatStats) {
    return <NoCombatStatsState onAddStats={onAddStats} />;
  }

  // Use editedCombatStats when editing, combatStats when viewing
  const displayStats = isEditing && editedCombatStats ? editedCombatStats : combatStats;

  if (!displayStats) {
    return <NoCombatStatsState onAddStats={onAddStats} />;
  }

  const traits = (displayStats.traits_json as MonsterTrait[]) || [];
  const actions = (displayStats.actions_json as MonsterAction[]) || [];
  const bonusActions = (displayStats.bonus_actions_json as MonsterAction[]) || [];
  const reactions = (displayStats.reactions_json as MonsterAction[]) || [];
  const legendaryActions = displayStats.legendary_actions_json;

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

  // Speed helpers
  const speedDisplay = displayStats.speed?.join(', ') || '30 ft.';

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
                  type="number"
                  value={displayStats.hp_max}
                  onChange={(e) => isEditing && onCombatStatsChange('hp_max', parseInt(e.target.value) || 0)}
                  readOnly={!isEditing}
                  disabled={isUpdating}
                  min={1}
                  max={999}
                  className="max-w-[120px] text-center"
                />
              </div>
              <div>
                <Label htmlFor="ac">Armor Class</Label>
                <Input
                  id="ac"
                  type="number"
                  value={displayStats.armor_class}
                  onChange={(e) => isEditing && onCombatStatsChange('armor_class', parseInt(e.target.value) || 0)}
                  readOnly={!isEditing}
                  disabled={isUpdating}
                  min={0}
                  max={30}
                  className="max-w-[120px] text-center"
                />
              </div>
              <div>
                <Label htmlFor="speed">Speed</Label>
                <Input
                  id="speed"
                  value={speedDisplay}
                  onChange={(e) => isEditing && onCombatStatsChange('speed', e.target.value.split(',').map((s) => s.trim()))}
                  readOnly={!isEditing}
                  disabled={isUpdating}
                  placeholder="30 ft., swim 40 ft."
                  className="max-w-[180px]"
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
                          type="number"
                          value={displayStats.strength}
                          onChange={(e) => isEditing && onCombatStatsChange('strength', parseInt(e.target.value) || 0)}
                          readOnly={!isEditing}
                          disabled={isUpdating}
                          min={1}
                          max={30}
                          className="text-center max-w-[70px] mx-auto mb-1"
                        />
                        <div className={cn('text-xs font-medium', getModifierColor(displayStats.strength))}>
                          ({getModifier(displayStats.strength)})
                        </div>
                      </TableCell>

                      {/* DEX */}
                      <TableCell className="text-center">
                        <Input
                          id="dex"
                          type="number"
                          value={displayStats.dexterity}
                          onChange={(e) => isEditing && onCombatStatsChange('dexterity', parseInt(e.target.value) || 0)}
                          readOnly={!isEditing}
                          disabled={isUpdating}
                          min={1}
                          max={30}
                          className="text-center max-w-[70px] mx-auto mb-1"
                        />
                        <div className={cn('text-xs font-medium', getModifierColor(displayStats.dexterity))}>
                          ({getModifier(displayStats.dexterity)})
                        </div>
                      </TableCell>

                      {/* CON */}
                      <TableCell className="text-center">
                        <Input
                          id="con"
                          type="number"
                          value={displayStats.constitution}
                          onChange={(e) => isEditing && onCombatStatsChange('constitution', parseInt(e.target.value) || 0)}
                          readOnly={!isEditing}
                          disabled={isUpdating}
                          min={1}
                          max={30}
                          className="text-center max-w-[70px] mx-auto mb-1"
                        />
                        <div className={cn('text-xs font-medium', getModifierColor(displayStats.constitution))}>
                          ({getModifier(displayStats.constitution)})
                        </div>
                      </TableCell>

                      {/* INT */}
                      <TableCell className="text-center">
                        <Input
                          id="int"
                          type="number"
                          value={displayStats.intelligence}
                          onChange={(e) => isEditing && onCombatStatsChange('intelligence', parseInt(e.target.value) || 0)}
                          readOnly={!isEditing}
                          disabled={isUpdating}
                          min={1}
                          max={30}
                          className="text-center max-w-[70px] mx-auto mb-1"
                        />
                        <div className={cn('text-xs font-medium', getModifierColor(displayStats.intelligence))}>
                          ({getModifier(displayStats.intelligence)})
                        </div>
                      </TableCell>

                      {/* WIS */}
                      <TableCell className="text-center">
                        <Input
                          id="wis"
                          type="number"
                          value={displayStats.wisdom}
                          onChange={(e) => isEditing && onCombatStatsChange('wisdom', parseInt(e.target.value) || 0)}
                          readOnly={!isEditing}
                          disabled={isUpdating}
                          min={1}
                          max={30}
                          className="text-center max-w-[70px] mx-auto mb-1"
                        />
                        <div className={cn('text-xs font-medium', getModifierColor(displayStats.wisdom))}>
                          ({getModifier(displayStats.wisdom)})
                        </div>
                      </TableCell>

                      {/* CHA */}
                      <TableCell className="text-center">
                        <Input
                          id="cha"
                          type="number"
                          value={displayStats.charisma}
                          onChange={(e) => isEditing && onCombatStatsChange('charisma', parseInt(e.target.value) || 0)}
                          readOnly={!isEditing}
                          disabled={isUpdating}
                          min={1}
                          max={30}
                          className="text-center max-w-[70px] mx-auto mb-1"
                        />
                        <div className={cn('text-xs font-medium', getModifierColor(displayStats.charisma))}>
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

      {/* Combat Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Combat Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <CombatPropertiesForm
            damageVulnerabilities={displayStats.damage_vulnerabilities || []}
            damageResistances={displayStats.damage_resistances || []}
            damageImmunities={displayStats.damage_immunities || []}
            conditionImmunities={displayStats.condition_immunities || []}
            gear={displayStats.gear || []}
            onChange={onCombatStatsChange}
            disabled={!isEditing || isUpdating}
          />
        </CardContent>
      </Card>

      {/* Traits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Traits</CardTitle>
          <CardDescription>
            {traits.length} / {MAX_ABILITIES} traits
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-4xl space-y-4">
          {traits.length > 0 && (
            <div className="space-y-2">
              {traits.map((trait, index) => (
                <AbilityCard
                  key={index}
                  ability={trait}
                  onDelete={() => {
                    if (isEditing) {
                      const updated = traits.filter((_, i) => i !== index);
                      onCombatStatsChange('traits_json', updated);
                    }
                  }}
                  editMode={isEditing}
                />
              ))}
            </div>
          )}
          {isEditing && (
            <AbilityBuilder
              abilityType="trait"
              onAdd={(trait) => {
                const updated = [...traits, trait];
                onCombatStatsChange('traits_json', updated);
              }}
              maxReached={traits.length >= MAX_ABILITIES}
            />
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
          <CardDescription>
            {actions.length} / {MAX_ABILITIES} actions
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-4xl space-y-4">
          {actions.length > 0 && (
            <div className="space-y-2">
              {actions.map((action, index) => (
                <AbilityCard
                  key={index}
                  ability={action}
                  onDelete={() => {
                    if (isEditing) {
                      const updated = actions.filter((_, i) => i !== index);
                      onCombatStatsChange('actions_json', updated);
                    }
                  }}
                  editMode={isEditing}
                />
              ))}
            </div>
          )}
          {isEditing && (
            <AbilityBuilder
              abilityType="action"
              onAdd={(action) => {
                const updated = [...actions, action as MonsterAction];
                onCombatStatsChange('actions_json', updated);
              }}
              maxReached={actions.length >= MAX_ABILITIES}
            />
          )}
        </CardContent>
      </Card>

      {/* Bonus Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bonus Actions</CardTitle>
          <CardDescription>
            {bonusActions.length} / {MAX_ABILITIES} bonus actions
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-4xl space-y-4">
          {bonusActions.length > 0 && (
            <div className="space-y-2">
              {bonusActions.map((action, index) => (
                <AbilityCard
                  key={index}
                  ability={action}
                  onDelete={() => {
                    if (isEditing) {
                      const updated = bonusActions.filter((_, i) => i !== index);
                      onCombatStatsChange('bonus_actions_json', updated);
                    }
                  }}
                  editMode={isEditing}
                />
              ))}
            </div>
          )}
          {isEditing && (
            <AbilityBuilder
              abilityType="bonus_action"
              onAdd={(action) => {
                const updated = [...bonusActions, action as MonsterAction];
                onCombatStatsChange('bonus_actions_json', updated);
              }}
              maxReached={bonusActions.length >= MAX_ABILITIES}
            />
          )}
        </CardContent>
      </Card>

      {/* Reactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reactions</CardTitle>
          <CardDescription>
            {reactions.length} / {MAX_ABILITIES} reactions
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-4xl space-y-4">
          {reactions.length > 0 && (
            <div className="space-y-2">
              {reactions.map((reaction, index) => (
                <AbilityCard
                  key={index}
                  ability={reaction}
                  onDelete={() => {
                    if (isEditing) {
                      const updated = reactions.filter((_, i) => i !== index);
                      onCombatStatsChange('reactions_json', updated);
                    }
                  }}
                  editMode={isEditing}
                />
              ))}
            </div>
          )}
          {isEditing && (
            <AbilityBuilder
              abilityType="reaction"
              onAdd={(reaction) => {
                const updated = [...reactions, reaction as MonsterAction];
                onCombatStatsChange('reactions_json', updated);
              }}
              maxReached={reactions.length >= MAX_ABILITIES}
            />
          )}
        </CardContent>
      </Card>

      {/* Legendary Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legendary Actions</CardTitle>
          <CardDescription>
            {legendaryActions ? `${legendaryActions.actions.length} / ${MAX_ABILITIES} legendary actions` : 'None'}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-4xl space-y-4">
          {legendaryActions && (
            <>
              <div className="grid grid-cols-2 gap-4 p-3 border rounded-lg bg-muted/30">
                <div>
                  <Label htmlFor="leg-uses">Uses</Label>
                  <Input
                    id="leg-uses"
                    type="number"
                    value={legendaryActions.uses}
                    onChange={(e) => {
                      if (isEditing) {
                        onCombatStatsChange('legendary_actions_json', {
                          ...legendaryActions,
                          uses: parseInt(e.target.value) || 3,
                        });
                      }
                    }}
                    readOnly={!isEditing}
                    disabled={isUpdating}
                    min={1}
                    max={10}
                    className="max-w-[100px]"
                  />
                </div>
                <div>
                  <Label htmlFor="leg-desc">Usage Description</Label>
                  <Input
                    id="leg-desc"
                    value={legendaryActions.usageDescription}
                    onChange={(e) => {
                      if (isEditing) {
                        onCombatStatsChange('legendary_actions_json', {
                          ...legendaryActions,
                          usageDescription: e.target.value,
                        });
                      }
                    }}
                    readOnly={!isEditing}
                    disabled={isUpdating}
                    placeholder="can use 3 per round"
                  />
                </div>
              </div>

              {legendaryActions.actions.length > 0 && (
                <div className="space-y-2">
                  {legendaryActions.actions.map((action, index) => (
                    <AbilityCard
                      key={index}
                      ability={action}
                      onDelete={() => {
                        if (isEditing) {
                          const updated = legendaryActions.actions.filter((_, i) => i !== index);
                          onCombatStatsChange('legendary_actions_json', {
                            ...legendaryActions,
                            actions: updated,
                          });
                        }
                      }}
                      editMode={isEditing}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {isEditing && (
            <>
              {!legendaryActions ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    onCombatStatsChange('legendary_actions_json', {
                      uses: 3,
                      usageDescription: 'can use 3 per round',
                      actions: [],
                    });
                  }}
                >
                  Enable Legendary Actions
                </Button>
              ) : (
                <AbilityBuilder
                  abilityType="legendary_action"
                  onAdd={(action) => {
                    const updated = [...legendaryActions.actions, action as MonsterAction];
                    onCombatStatsChange('legendary_actions_json', {
                      ...legendaryActions,
                      actions: updated,
                    });
                  }}
                  maxReached={legendaryActions.actions.length >= MAX_ABILITIES}
                />
              )}
            </>
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
                  Are you sure you want to remove all combat statistics for {npc.name}? This will delete HP, AC,
                  ability scores, and all abilities. This action cannot be undone.
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
      )}
    </div>
  );
}
