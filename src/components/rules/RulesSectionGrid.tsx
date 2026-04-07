'use client';

import Link from 'next/link';
import { useLanguageStore } from '@/stores/languageStore';
import { ALL_SECTIONS } from '@/data/rules';

export function RulesSectionGrid() {
  const language = useLanguageStore((s) => s.selectedLanguage);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {ALL_SECTIONS.map((section) => {
        const Icon = section.icon;
        const subsectionCount = section.subsections.length;

        return (
          <Link
            key={section.id}
            href={`/rules/${section.id}`}
            className="group flex flex-col gap-3 p-5 rounded-lg border border-border/40 bg-slate-900/50 hover:bg-slate-800/60 hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {section.number}. {section.title[language]}
                </h2>
                <p className="text-xs text-slate-500">
                  {subsectionCount} {language === 'pl' ? 'sekcji' : 'sections'}
                </p>
              </div>
            </div>
            <ul className="text-xs text-slate-400 space-y-0.5 ml-1">
              {section.subsections.slice(0, 4).map((sub) => (
                <li key={sub.id} className="truncate">• {sub.title[language]}</li>
              ))}
              {subsectionCount > 4 && (
                <li className="text-slate-500">
                  +{subsectionCount - 4} {language === 'pl' ? 'więcej' : 'more'}...
                </li>
              )}
            </ul>
          </Link>
        );
      })}
    </div>
  );
}
