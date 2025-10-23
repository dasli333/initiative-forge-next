'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { CreatePlayerCharacterCommand } from '@/types';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface BasicInfoSectionProps {
  form: UseFormReturn<CreatePlayerCharacterCommand>;
}

/**
 * Form section for basic character information
 * Contains fields: Name, Max HP, AC, Speed
 */
export const BasicInfoSection = ({ form }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} data-testid="character-name-input" placeholder="Character name" autoFocus />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="max_hp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max HP</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-testid="character-max-hp-input"
                  type="number"
                  min={1}
                  max={32767}
                  placeholder="HP"
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="armor_class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AC</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-testid="character-ac-input"
                  type="number"
                  min={0}
                  max={32767}
                  placeholder="AC"
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="speed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Speed (ft)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-testid="character-speed-input"
                  type="number"
                  min={0}
                  max={32767}
                  placeholder="Speed"
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
