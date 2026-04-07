'use client';

import { useWeaponProperties } from '@/hooks/useWeaponProperties';
import { useWeaponMasteryProperties } from '@/hooks/useWeaponMasteryProperties';
import { useLanguageStore } from '@/stores/languageStore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function WeaponPropertiesReference() {
  const { data: properties, isLoading: loadingProps } = useWeaponProperties();
  const { data: masteryProperties, isLoading: loadingMastery } = useWeaponMasteryProperties();
  const language = useLanguageStore((s) => s.selectedLanguage);

  const isLoading = loadingProps || loadingMastery;

  if (isLoading) {
    return (
      <div className="space-y-2 my-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="my-4 space-y-6">
      {properties && properties.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
            {language === 'pl' ? 'Właściwości broni (z bazy)' : 'Weapon Properties (from DB)'}
            <Badge variant="outline" className="text-xs">DB</Badge>
          </h4>
          <Accordion type="multiple" className="space-y-1">
            {properties.map((prop) => (
              <AccordionItem
                key={prop.id}
                value={prop.id}
                className="border border-border/30 rounded-md px-3 bg-slate-900/50"
              >
                <AccordionTrigger className="text-sm font-medium text-slate-200 hover:no-underline">
                  {prop.name[language]}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-300 whitespace-pre-line">
                  {prop.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {masteryProperties && masteryProperties.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
            {language === 'pl' ? 'Właściwości mistrzostwa broni' : 'Weapon Mastery Properties'}
            <Badge variant="outline" className="text-xs">DB</Badge>
          </h4>
          <Accordion type="multiple" className="space-y-1">
            {masteryProperties.map((prop) => (
              <AccordionItem
                key={prop.id}
                value={prop.id}
                className="border border-border/30 rounded-md px-3 bg-slate-900/50"
              >
                <AccordionTrigger className="text-sm font-medium text-slate-200 hover:no-underline">
                  {prop.name[language]}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-300 whitespace-pre-line">
                  {prop.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
