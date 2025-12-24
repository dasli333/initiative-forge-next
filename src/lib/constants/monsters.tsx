/**
 * Monster CR color mapping for visual distinction in lists
 * Pattern matches spells.tsx for consistency
 * Gradient from cool (weak) to warm (legendary)
 */

export interface ChallengeRatingInfo {
  color: string;
}

/**
 * CR tier color definitions
 */
const CR_COLORS = {
  trivial: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border-slate-200 dark:border-slate-800',
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
  low: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  moderate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  challenging: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  hard: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  veryHard: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  deadly: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  extreme: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  legendary: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
} as const;

/**
 * Convert CR string to numeric value for comparison
 */
function crToNumber(rating: string): number {
  if (rating === '1/8') return 0.125;
  if (rating === '1/4') return 0.25;
  if (rating === '1/2') return 0.5;
  return parseFloat(rating) || 0;
}

/**
 * Get CR color based on challenge rating string
 * @param rating - CR as string (e.g., "0", "1/8", "5", "30")
 */
export function getChallengeRatingColor(rating: string): string {
  const numericCR = crToNumber(rating);

  if (numericCR === 0) return CR_COLORS.trivial;
  if (numericCR <= 0.5) return CR_COLORS.easy;
  if (numericCR <= 2) return CR_COLORS.low;
  if (numericCR <= 4) return CR_COLORS.moderate;
  if (numericCR <= 7) return CR_COLORS.challenging;
  if (numericCR <= 10) return CR_COLORS.hard;
  if (numericCR <= 14) return CR_COLORS.veryHard;
  if (numericCR <= 17) return CR_COLORS.deadly;
  if (numericCR <= 20) return CR_COLORS.extreme;
  return CR_COLORS.legendary; // CR 21-30
}
