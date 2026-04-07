import type { LucideIcon } from 'lucide-react';

export interface BilingualText {
  en: string;
  pl: string;
}

export interface RulesTable {
  headers: BilingualText[];
  rows: BilingualText[][];
}

export interface RulesSubsection {
  id: string;
  title: BilingualText;
  content?: BilingualText;
  tables?: RulesTable[];
  tips?: BilingualText[];
}

export interface RulesSection {
  id: string;
  number: number;
  title: BilingualText;
  icon: LucideIcon;
  subsections: RulesSubsection[];
  linkedDataType?: 'conditions' | 'weapon-properties' | 'weapon-mastery-properties';
}
