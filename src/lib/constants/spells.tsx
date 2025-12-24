/**
 * Spell level color mapping for visual distinction in lists
 * Pattern matches equipment.tsx for consistency
 */

export interface SpellLevelInfo {
  label: string;
  color: string;
}

const SPELL_LEVEL_COLORS: Record<number, SpellLevelInfo> = {
  0: {
    label: 'Cantrip',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border-slate-200 dark:border-slate-800'
  },
  1: {
    label: '1st Level',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800'
  },
  2: {
    label: '2nd Level',
    color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800'
  },
  3: {
    label: '3rd Level',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  },
  4: {
    label: '4th Level',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
  },
  5: {
    label: '5th Level',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  },
  6: {
    label: '6th Level',
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800'
  },
  7: {
    label: '7th Level',
    color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800'
  },
  8: {
    label: '8th Level',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
  },
  9: {
    label: '9th Level',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  }
};

/**
 * Get spell level display info (label and color)
 */
export function getSpellLevelInfo(level: number, isCantrip: boolean): SpellLevelInfo {
  const effectiveLevel = isCantrip ? 0 : level;
  return SPELL_LEVEL_COLORS[effectiveLevel] ?? SPELL_LEVEL_COLORS[0];
}
