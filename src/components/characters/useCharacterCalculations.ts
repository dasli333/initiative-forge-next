'use client';

import { useMemo } from 'react';

/**
 * Interface for calculated character statistics
 */
export interface CalculatedStats {
  initiativeModifier: number;
  passivePerception: number;
}

/**
 * Hook for calculating derived character statistics
 * Calculates initiative modifier from dexterity and passive perception from wisdom
 */
export const useCharacterCalculations = (dexterity: number, wisdom: number): CalculatedStats => {
  return useMemo(
    () => ({
      initiativeModifier: Math.floor((dexterity - 10) / 2),
      passivePerception: 10 + Math.floor((wisdom - 10) / 2),
    }),
    [dexterity, wisdom]
  );
};
