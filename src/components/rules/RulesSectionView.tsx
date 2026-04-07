'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguageStore } from '@/stores/languageStore';
import { useActiveRulesSection } from '@/hooks/useActiveRulesSection';
import { ALL_SECTIONS } from '@/data/rules';
import type { RulesSection as RulesSectionType } from '@/data/rules/types';
import { RulesSubsection } from './RulesSubsection';
import { ConditionsReference } from './ConditionsReference';
import { WeaponPropertiesReference } from './WeaponPropertiesReference';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GradientSeparator } from '@/components/library/GradientSeparator';
import { cn } from '@/lib/utils';

interface RulesSectionViewProps {
  sectionId: string;
}

export function RulesSectionView({ sectionId }: RulesSectionViewProps) {
  const language = useLanguageStore((s) => s.selectedLanguage);
  const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);
  const { activeSubsectionId } = useActiveRulesSection();

  const { section, prevSection, nextSection } = useMemo(() => {
    const idx = ALL_SECTIONS.findIndex((s) => s.id === sectionId);
    return {
      section: ALL_SECTIONS[idx] as RulesSectionType | undefined,
      prevSection: idx > 0 ? ALL_SECTIONS[idx - 1] : null,
      nextSection: idx < ALL_SECTIONS.length - 1 ? ALL_SECTIONS[idx + 1] : null,
    };
  }, [sectionId]);

  if (!section) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <p>{language === 'pl' ? 'Sekcja nie znaleziona' : 'Section not found'}</p>
        <Link href="/rules" className="text-emerald-400 hover:underline mt-2 text-sm">
          {language === 'pl' ? '← Powrót do zasad' : '← Back to rules'}
        </Link>
      </div>
    );
  }

  const Icon = section.icon;

  const scrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href="/rules"
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {language === 'pl' ? 'Zasady' : 'Rules'}
        </Link>
        <span className="text-slate-600">/</span>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-emerald-500" />
          <h1 className="text-xl font-bold text-emerald-400">
            {section.number}. {section.title[language]}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="section-language-switch" className="text-sm font-medium cursor-pointer">
            {language === 'en' ? 'EN' : 'PL'}
          </Label>
          <Switch
            id="section-language-switch"
            checked={language === 'pl'}
            onCheckedChange={toggleLanguage}
            aria-label="Toggle language"
          />
        </div>
      </div>

      {/* Content area with subsection TOC sidebar */}
      <div className="flex flex-1 min-h-0 gap-4">
        {/* Subsection TOC */}
        <div className="w-56 shrink-0">
          <ScrollArea className="h-full pr-2">
            <nav className="space-y-0.5 text-sm" aria-label="Subsections">
              {section.subsections.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => scrollTo(sub.id)}
                  className={cn(
                    'block w-full text-left px-2 py-1.5 rounded text-xs transition-colors truncate',
                    'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30',
                    activeSubsectionId === sub.id && 'text-emerald-400 bg-slate-800/40 border-l-2 border-emerald-500'
                  )}
                >
                  {sub.title[language]}
                </button>
              ))}
            </nav>
          </ScrollArea>
        </div>

        {/* Section content */}
        <div className="flex-1 min-w-0 overflow-y-auto rounded-lg border border-border/30 bg-slate-900/30 px-6 py-4">
          {section.subsections.map((sub) => (
            <RulesSubsection key={sub.id} subsection={sub} language={language} />
          ))}

          {section.linkedDataType === 'conditions' && <ConditionsReference />}
          {section.linkedDataType === 'weapon-properties' && <WeaponPropertiesReference />}

          {/* Prev/Next navigation */}
          <GradientSeparator />
          <div className="flex justify-between items-center mt-6 pb-4">
            {prevSection ? (
              <Link
                href={`/rules/${prevSection.id}`}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                {prevSection.number}. {prevSection.title[language]}
              </Link>
            ) : (
              <div />
            )}
            {nextSection ? (
              <Link
                href={`/rules/${nextSection.id}`}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
              >
                {nextSection.number}. {nextSection.title[language]}
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
