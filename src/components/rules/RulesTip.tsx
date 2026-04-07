'use client';

import { Lightbulb } from 'lucide-react';
import type { Language } from '@/stores/languageStore';
import type { BilingualText } from '@/data/rules/types';

interface RulesTipProps {
  tip: BilingualText;
  language: Language;
}

export function RulesTip({ tip, language }: RulesTipProps) {
  return (
    <div className="flex gap-2 my-3 px-3 py-2 rounded-md bg-amber-950/30 border border-amber-800/40 text-amber-200 text-sm">
      <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
      <span>{tip[language]}</span>
    </div>
  );
}
