'use client';

import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import type { CreatePlayerCharacterCommand, ActionDTO } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ActionsList } from './ActionsList';
import { ActionBuilder } from './ActionBuilder';

interface ActionsSectionProps {
  form: UseFormReturn<CreatePlayerCharacterCommand>;
}

/**
 * Collapsible section for managing character actions
 */
export const ActionsSection = ({ form }: ActionsSectionProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'actions',
  });

  const handleAddAction = (action: ActionDTO) => {
    append(action);
  };

  const maxActionsReached = fields.length >= 20;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="actions">
        <AccordionTrigger className="text-lg font-semibold">
          Actions (optional)
          {fields.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({fields.length}/20)</span>
          )}
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-4">
          <ActionsList actions={fields as ActionDTO[]} onRemove={remove} />
          <ActionBuilder onAdd={handleAddAction} maxActionsReached={maxActionsReached} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
