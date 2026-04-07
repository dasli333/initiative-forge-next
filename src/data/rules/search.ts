import type { Language } from '@/stores/languageStore';
import { ALL_SECTIONS } from './index';
import type { RulesSection, RulesSubsection } from './types';

export interface RulesSearchResult {
  sectionId: string;
  sectionTitle: string;
  subsectionId: string;
  subsectionTitle: string;
  snippet: string;
}

export function searchRules(query: string, language: Language): RulesSearchResult[] {
  if (!query || query.length < 2) return [];

  const q = query.toLowerCase();
  const results: RulesSearchResult[] = [];

  for (const section of ALL_SECTIONS) {
    for (const sub of section.subsections) {
      const titleMatch = sub.title[language].toLowerCase().includes(q);
      const contentMatch = sub.content?.[language]?.toLowerCase().includes(q);

      if (titleMatch || contentMatch) {
        results.push({
          sectionId: section.id,
          sectionTitle: section.title[language],
          subsectionId: sub.id,
          subsectionTitle: sub.title[language],
          snippet: getSnippet(sub, language, q),
        });
      }
    }
  }

  return results;
}

function getSnippet(sub: RulesSubsection, lang: Language, query: string): string {
  const content = sub.content?.[lang] || '';
  const idx = content.toLowerCase().indexOf(query);
  if (idx === -1) return sub.title[lang];

  const start = Math.max(0, idx - 30);
  const end = Math.min(content.length, idx + query.length + 50);
  let snippet = content.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  return snippet;
}

export function getAllSearchableSections(): { section: RulesSection; subsection: RulesSubsection }[] {
  return ALL_SECTIONS.flatMap((section) =>
    section.subsections.map((subsection) => ({ section, subsection }))
  );
}
