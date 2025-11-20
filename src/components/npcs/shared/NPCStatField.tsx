'use client';

import { type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NPCStatFieldProps {
  icon: LucideIcon;
  label: string;
  value?: string | number | null;
  badge?: boolean;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

/**
 * Single stat field display for NPC character card
 * - Icon + label + value in compact layout
 * - Optional badge variant for status fields
 */
export function NPCStatField({
  icon: Icon,
  label,
  value,
  badge = false,
  badgeVariant = 'default',
}: NPCStatFieldProps) {
  // Display placeholder if no value
  const displayValue = (!value && value !== 0) ? '—' : value;

  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        {badge ? (
          <Badge variant={badgeVariant} className="text-xs mt-0.5">
            {displayValue}
          </Badge>
        ) : (
          <div className="text-sm font-medium truncate text-foreground">
            {displayValue}
          </div>
        )}
      </div>
    </div>
  );
}
