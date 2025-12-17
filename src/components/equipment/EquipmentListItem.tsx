'use client';

import { Badge } from '@/components/ui/badge';
import type { EquipmentDTO } from '@/types';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/stores/languageStore';

interface EquipmentListItemProps {
  /** Equipment data to display */
  equipment: EquipmentDTO;
  /** Whether this item is currently selected */
  isSelected: boolean;
  /** Callback fired when item is clicked */
  onClick: (equipmentId: string) => void;
}

/**
 * Format cost for display (e.g., "15 gp", "5 sp")
 */
function formatCost(cost?: { quantity: number; unit: string }): string | null {
  if (!cost) return null;
  return `${cost.quantity} ${cost.unit}`;
}

/**
 * Format weight for display (e.g., "3 lb")
 */
function formatWeight(weight?: number): string | null {
  if (weight === undefined || weight === null) return null;
  return `${weight} lb`;
}

/**
 * Get primary category from equipment categories
 */
function getPrimaryCategory(categories: Array<{ id: string; name: string }>): string {
  if (!categories || categories.length === 0) return 'Item';
  // Return the first category's name
  return categories[0].name;
}

/**
 * Compact list item component for displaying a single equipment item
 * Shows name, primary category badge, cost, and weight
 */
export function EquipmentListItem({ equipment, isSelected, onClick }: EquipmentListItemProps) {
  const { id, data } = equipment;

  // Get selected language from store
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const displayName = data.name[selectedLanguage];
  const primaryCategory = getPrimaryCategory(data.equipment_categories);
  const cost = formatCost(data.cost);
  const weight = formatWeight(data.weight);

  const handleClick = () => {
    onClick(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(id);
    }
  };

  return (
    <div
      className={cn(
        'py-3 px-4 cursor-pointer transition-all duration-200 border-b border-border',
        'hover:bg-muted/70 hover:border-l-2 hover:border-l-emerald-500/50',
        isSelected && 'bg-emerald-500/5 border-l-4 border-l-emerald-500'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${displayName}`}
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium truncate">{displayName}</h3>
        <div className="flex items-center gap-1 flex-wrap">
          <Badge className="bg-emerald-500 hover:bg-emerald-600 flex-shrink-0 text-xs shadow-sm">
            {primaryCategory}
          </Badge>
          {cost && <span className="text-xs bg-muted/40 px-1.5 py-0.5 rounded">{cost}</span>}
          {weight && <span className="text-xs bg-muted/40 px-1.5 py-0.5 rounded">{weight}</span>}
        </div>
      </div>
    </div>
  );
}
