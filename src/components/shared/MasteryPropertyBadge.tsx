'use client';

import { Badge } from '@/components/ui/badge';
import { PropertyHoverCard } from './PropertyHoverCard';
import { useWeaponMasteryProperties } from '@/hooks/useWeaponMasteryProperties';
import { useLanguageStore } from '@/stores/languageStore';

interface MasteryPropertyBadgeProps {
  /** Weapon mastery property ID (e.g., 'cleave', 'graze') */
  masteryId: string;
  /** Display name from equipment data (fallback) */
  masteryName: string;
}

/**
 * Badge displaying weapon mastery property with hover tooltip.
 * Shows bilingual names and full description on hover.
 * Uses purple color to distinguish from regular weapon properties.
 */
export function MasteryPropertyBadge({ masteryId, masteryName }: MasteryPropertyBadgeProps) {
  const { data: masteryProperties } = useWeaponMasteryProperties();
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);

  const mastery = masteryProperties?.find((m) => m.id === masteryId);

  // Fallback if mastery not found in reference data
  if (!mastery) {
    return (
      <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
        {masteryName}
      </Badge>
    );
  }

  return (
    <PropertyHoverCard name={mastery.name} description={mastery.description}>
      <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-help">
        {mastery.name[selectedLanguage]}
      </Badge>
    </PropertyHoverCard>
  );
}
