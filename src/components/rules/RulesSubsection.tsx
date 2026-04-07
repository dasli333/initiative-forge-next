'use client';

import type { Language } from '@/stores/languageStore';
import type { RulesSubsection as RulesSubsectionType } from '@/data/rules/types';
import { RulesTable } from './RulesTable';
import { RulesTip } from './RulesTip';

interface RulesSubsectionProps {
  subsection: RulesSubsectionType;
  language: Language;
}

export function RulesSubsection({ subsection, language }: RulesSubsectionProps) {
  return (
    <div id={subsection.id} data-subsection-id={subsection.id} className="scroll-mt-20 mb-6">
      <h3 className="text-base font-semibold text-slate-100 mb-2">
        {subsection.title[language]}
      </h3>

      {subsection.content && (
        <div className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
          {subsection.content[language]}
        </div>
      )}

      {subsection.tables?.map((table, i) => (
        <RulesTable key={i} table={table} language={language} />
      ))}

      {subsection.tips?.map((tip, i) => (
        <RulesTip key={i} tip={tip} language={language} />
      ))}
    </div>
  );
}
