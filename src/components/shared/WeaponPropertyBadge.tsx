'use client';

import { Badge } from '@/components/ui/badge';
import { PropertyHoverCard } from './PropertyHoverCard';
import { useWeaponProperties } from '@/hooks/useWeaponProperties';
import { useLanguageStore } from '@/stores/languageStore';

interface WeaponPropertyBadgeProps {
  /** Weapon property ID (e.g., 'finesse', 'versatile') */
  propertyId: string;
  /** Display name from equipment data (fallback) */
  propertyName: string;
}

/**
 * Badge displaying weapon property with hover tooltip.
 * Shows bilingual names and full description on hover.
 */
export function WeaponPropertyBadge({ propertyId, propertyName }: WeaponPropertyBadgeProps) {
  const { data: properties } = useWeaponProperties();
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);

  const property = properties?.find((p) => p.id === propertyId);

  // Fallback if property not found in reference data
  if (!property) {
    return (
      <Badge variant="secondary" className="text-xs">
        {propertyName}
      </Badge>
    );
  }

  return (
    <PropertyHoverCard name={property.name} description={property.description}>
      <Badge variant="secondary" className="text-xs cursor-help">
        {property.name[selectedLanguage]}
      </Badge>
    </PropertyHoverCard>
  );
}
