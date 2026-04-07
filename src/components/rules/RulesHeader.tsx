'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguageStore } from '@/stores/languageStore';
import { searchRules, type RulesSearchResult } from '@/data/rules/search';
import { useState, useMemo, useRef, useEffect } from 'react';

interface RulesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  debouncedQuery: string;
  onResultNavigate?: (sectionId: string, subsectionId: string) => void;
}

export function RulesHeader({ searchQuery, onSearchChange, debouncedQuery, onResultNavigate }: RulesHeaderProps) {
  const language = useLanguageStore((s) => s.selectedLanguage);
  const toggleLanguage = useLanguageStore((s) => s.toggleLanguage);
  const [dismissedQuery, setDismissedQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchRules(debouncedQuery, language), [debouncedQuery, language]);
  const showResults = results.length > 0 && debouncedQuery.length >= 2 && dismissedQuery !== debouncedQuery;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDismissedQuery(debouncedQuery);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [debouncedQuery]);

  const handleResultClick = (result: RulesSearchResult) => {
    setDismissedQuery(debouncedQuery);
    if (onResultNavigate) {
      onResultNavigate(result.sectionId, result.subsectionId);
    } else {
      const el = document.getElementById(result.subsectionId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="flex items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold shrink-0">
        {language === 'pl' ? 'Zasady D&D 5E' : 'D&D 5E Rules'}
      </h1>

      <div ref={containerRef} className="relative flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => results.length > 0 && setDismissedQuery('')}
            placeholder={language === 'pl' ? 'Szukaj w zasadach...' : 'Search rules...'}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showResults && (
          <div className="absolute z-50 top-full mt-1 w-full max-h-80 overflow-y-auto rounded-md border border-border/50 bg-slate-900 shadow-lg">
            {results.map((result, i) => (
              <button
                key={`${result.subsectionId}-${i}`}
                onClick={() => handleResultClick(result)}
                className="w-full text-left px-3 py-2 hover:bg-slate-800/70 transition-colors border-b border-border/20 last:border-b-0"
              >
                <div className="text-xs text-emerald-400">{result.sectionTitle}</div>
                <div className="text-sm text-slate-200 font-medium">{result.subsectionTitle}</div>
                <div className="text-xs text-slate-400 truncate">{result.snippet}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Label htmlFor="rules-language-switch" className="text-sm font-medium cursor-pointer">
          {language === 'en' ? 'EN' : 'PL'}
        </Label>
        <Switch
          id="rules-language-switch"
          checked={language === 'pl'}
          onCheckedChange={toggleLanguage}
          aria-label="Toggle language"
        />
      </div>
    </header>
  );
}
