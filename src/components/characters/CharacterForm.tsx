'use client';

import { forwardRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePlayerCharacterCommandSchema, type CreatePlayerCharacterCommand } from '@/lib/schemas/player-character.schema';
import type { PlayerCharacterDTO, ActionDTO } from '@/types';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { BasicInfoSection } from './BasicInfoSection';
import { AbilityScoresSection } from './AbilityScoresSection';
import { AutoCalculatedDisplays } from './AutoCalculatedDisplays';
import { ActionsSection } from './ActionsSection';

interface CharacterFormProps {
  mode: 'create' | 'edit';
  defaultValues?: PlayerCharacterDTO;
  onSubmit: (data: CreatePlayerCharacterCommand) => Promise<void>;
  onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * Main form component for creating/editing player characters
 * Uses React Hook Form with Zod validation
 */
export const CharacterForm = forwardRef<HTMLFormElement, CharacterFormProps>(
  ({ mode, defaultValues, onSubmit, onDirtyChange }, ref) => {
    const form = useForm<CreatePlayerCharacterCommand>({
      resolver: zodResolver(CreatePlayerCharacterCommandSchema),
      defaultValues: defaultValues
        ? {
            name: defaultValues.name,
            max_hp: defaultValues.max_hp,
            armor_class: defaultValues.armor_class,
            speed: defaultValues.speed,
            strength: defaultValues.strength,
            dexterity: defaultValues.dexterity,
            constitution: defaultValues.constitution,
            intelligence: defaultValues.intelligence,
            wisdom: defaultValues.wisdom,
            charisma: defaultValues.charisma,
            actions: (defaultValues.actions as unknown as ActionDTO[]) || [],
          }
        : {
            name: '',
            max_hp: 1,
            armor_class: 10,
            speed: 30,
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
            actions: [],
          },
    });

    const dexterity = form.watch('dexterity');
    const wisdom = form.watch('wisdom');

    // Notify parent component when form dirty state changes
    useEffect(() => {
      if (onDirtyChange) {
        onDirtyChange(form.formState.isDirty);
      }
    }, [form.formState.isDirty, onDirtyChange]);

    return (
      <Form {...form}>
        <form ref={ref} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-medium">Basic Information</h3>
              <p className="text-xs text-muted-foreground">Core character stats</p>
            </div>
            <BasicInfoSection form={form} />
          </div>

          <Separator />

          <div className="space-y-3">
            <div>
              <h3 className="text-base font-medium">Ability Scores</h3>
              <p className="text-xs text-muted-foreground">D&D 5e ability scores (1-30)</p>
            </div>
            <AbilityScoresSection form={form} />
            <AutoCalculatedDisplays dexterity={dexterity} wisdom={wisdom} />
          </div>

          <Separator />

          <ActionsSection form={form} />
        </form>
      </Form>
    );
  }
);

CharacterForm.displayName = 'CharacterForm';
