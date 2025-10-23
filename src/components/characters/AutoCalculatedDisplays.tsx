'use client';

import { Badge } from '@/components/ui/badge';
import { useCharacterCalculations } from './useCharacterCalculations';

interface AutoCalculatedDisplaysProps {
  dexterity: number;
  wisdom: number;
}

/**
 * Component that displays automatically calculated character statistics
 * Updates in real-time as ability scores change
 */
export const AutoCalculatedDisplays = ({ dexterity, wisdom }: AutoCalculatedDisplaysProps) => {
  const { initiativeModifier, passivePerception } = useCharacterCalculations(dexterity, wisdom);

  const formatModifier = (modifier: number): string => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="flex flex-wrap gap-4" role="status" aria-live="polite" aria-atomic="true">
      <Badge variant="secondary" className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
        Initiative Modifier: {formatModifier(initiativeModifier)}
      </Badge>

      <Badge variant="secondary" className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
        Passive Perception: {passivePerception}
      </Badge>
    </div>
  );
};
