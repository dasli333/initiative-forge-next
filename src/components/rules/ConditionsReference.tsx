'use client';

import { useConditions } from '@/hooks/useConditions';
import { useLanguageStore } from '@/stores/languageStore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';

export function ConditionsReference() {
  const { data: conditions, isLoading } = useConditions();
  const language = useLanguageStore((s) => s.selectedLanguage);

  if (isLoading) {
    return (
      <div className="space-y-2 my-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!conditions?.length) return null;

  return (
    <div className="my-4">
      <h3 className="text-base font-semibold text-slate-100 mb-3">
        {language === 'pl' ? 'Tabela stanów' : 'Conditions Table'}
      </h3>
      <Accordion type="multiple" className="space-y-1">
        {conditions.map((condition) => (
          <AccordionItem
            key={condition.id}
            value={condition.id}
            className="border border-border/30 rounded-md px-3 bg-slate-900/50"
          >
            <AccordionTrigger className="text-sm font-medium text-slate-200 hover:no-underline">
              {condition.name[language]}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-slate-300 whitespace-pre-line">
              {condition.description}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
