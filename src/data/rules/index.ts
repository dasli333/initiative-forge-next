import { basicsSection } from './01-basics';
import { combatSection } from './02-combat';
import { magicSection } from './03-magic';
import { restSection } from './04-rest';
import { conditionsSection } from './05-conditions';
import { adventuringSection } from './06-adventuring';
import { progressionSection } from './07-progression';
import { multiclassingSection } from './08-multiclassing';
import { dmReferenceSection } from './09-dm-reference';
import type { RulesSection } from './types';

export const ALL_SECTIONS: RulesSection[] = [
  basicsSection,
  combatSection,
  magicSection,
  restSection,
  conditionsSection,
  adventuringSection,
  progressionSection,
  multiclassingSection,
  dmReferenceSection,
];

export type { RulesSection, RulesSubsection, RulesTable, BilingualText } from './types';
