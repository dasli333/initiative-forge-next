'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useCharactersQuery } from '@/hooks/useCharacters';
import { getSupabaseClient } from '@/lib/supabase';
import type { CreateCombatCommand } from '@/types';

interface SimplifiedCombatCreationProps {
  campaignId: string;
  campaignName: string;
}

/**
 * Simplified combat creation form
 * NOTE: This is a simplified version. The full 5-step wizard with monsters and NPCs
 * can be implemented later for a more complete experience.
 */
export function SimplifiedCombatCreation({ campaignId, campaignName }: SimplifiedCombatCreationProps) {
  const router = useRouter();
  const [combatName, setCombatName] = useState('');
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);

  const { data: characters = [], isLoading } = useCharactersQuery(campaignId);

  const createCombatMutation = useMutation({
    mutationFn: async (command: CreateCombatCommand) => {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('combats')
        .insert({
          campaign_id: campaignId,
          name: command.name,
          status: 'active',
          current_round: 1,
          state_snapshot: {
            participants: command.initial_participants.map((p) => {
              // Type guard: we know all participants in simplified form are player_character type
              if (p.source !== 'player_character') {
                throw new Error('Invalid participant source in simplified combat creation');
              }

              const character = characters.find((c) => c.id === p.player_character_id);

              return {
                id: crypto.randomUUID(),
                source: p.source,
                player_character_id: p.player_character_id,
                display_name: character?.name || 'Unknown',
                initiative: null,
                current_hp: character?.max_hp || 1,
                max_hp: character?.max_hp || 1,
                armor_class: character?.armor_class || 10,
                stats: {
                  str: character?.strength || 10,
                  dex: character?.dexterity || 10,
                  con: character?.constitution || 10,
                  int: character?.intelligence || 10,
                  wis: character?.wisdom || 10,
                  cha: character?.charisma || 10,
                },
                actions: [],
                is_active_turn: false,
                active_conditions: [],
              };
            }),
            active_participant_index: null,
          } as any,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating combat:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (combat) => {
      toast.success('Combat created successfully');
      router.push(`/combats/${combat.id}`);
    },
    onError: (error: Error) => {
      toast.error('Failed to create combat');
      console.error('Error creating combat:', error);
    },
  });

  const handleToggleCharacter = useCallback((characterId: string) => {
    setSelectedCharacterIds((prev) =>
      prev.includes(characterId) ? prev.filter((id) => id !== characterId) : [...prev, characterId]
    );
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!combatName.trim()) {
        toast.error('Please enter a combat name');
        return;
      }

      if (selectedCharacterIds.length === 0) {
        toast.error('Please select at least one character');
        return;
      }

      const command: CreateCombatCommand = {
        name: combatName,
        initial_participants: selectedCharacterIds.map((id) => ({
          source: 'player_character',
          player_character_id: id,
        })),
      };

      createCombatMutation.mutate(command);
    },
    [combatName, selectedCharacterIds, createCombatMutation]
  );

  const handleCancel = useCallback(() => {
    router.push(`/campaigns/${campaignId}/combats`);
  }, [campaignId, router]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/campaigns">My Campaigns</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/campaigns/${campaignId}`}>{campaignName}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/campaigns/${campaignId}/combats`}>Combats</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>New Combat</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Create New Combat</h1>
          <p className="text-muted-foreground mt-2">Set up a new combat encounter with your player characters</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Combat Name */}
          <Card>
            <CardHeader>
              <CardTitle>Combat Name</CardTitle>
              <CardDescription>Give this encounter a memorable name</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="combat-name">Name *</Label>
                <Input
                  id="combat-name"
                  value={combatName}
                  onChange={(e) => setCombatName(e.target.value)}
                  placeholder="e.g., Goblin Ambush, Dragon's Lair"
                  autoFocus
                  maxLength={255}
                />
              </div>
            </CardContent>
          </Card>

          {/* Player Characters */}
          <Card>
            <CardHeader>
              <CardTitle>Select Player Characters</CardTitle>
              <CardDescription>Choose which characters will participate in this combat</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading characters...</div>
              ) : characters.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No characters found in this campaign</p>
                  <Button asChild variant="outline">
                    <Link href={`/campaigns/${campaignId}/characters`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Characters
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {characters.map((character) => (
                    <div key={character.id} className="flex items-center space-x-3 p-3 border rounded hover:bg-accent">
                      <Checkbox
                        id={`char-${character.id}`}
                        checked={selectedCharacterIds.includes(character.id)}
                        onCheckedChange={() => handleToggleCharacter(character.id)}
                      />
                      <label htmlFor={`char-${character.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{character.name}</div>
                        <div className="text-sm text-muted-foreground">
                          HP: {character.max_hp} | AC: {character.armor_class}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Note about simplified version */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">Simplified Version</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800 dark:text-blue-200">
              <p className="text-sm">
                This is a simplified combat creation form. You can add monsters and NPCs directly in the combat tracker
                after creating the encounter.
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={createCombatMutation.isPending}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCombatMutation.isPending || !combatName.trim() || selectedCharacterIds.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {createCombatMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Combat'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
