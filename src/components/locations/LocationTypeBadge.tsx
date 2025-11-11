import { Badge } from '@/components/ui/badge';
import { Globe, Castle, Building2, Home, Skull, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface LocationTypeBadgeProps {
  type: string;
  className?: string;
}

interface TypeConfig {
  label: string;
  icon: LucideIcon;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
}

const TYPE_CONFIGS: Record<string, TypeConfig> = {
  kontynent: {
    label: 'Continent',
    icon: Globe,
    variant: 'default',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  królestwo: {
    label: 'Kingdom',
    icon: Castle,
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  miasto: {
    label: 'City',
    icon: Building2,
    variant: 'default',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  budynek: {
    label: 'Building',
    icon: Home,
    variant: 'default',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  dungeon: {
    label: 'Dungeon',
    icon: Skull,
    variant: 'default',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  inne: {
    label: 'Other',
    icon: MapPin,
    variant: 'outline',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  },
};

export function LocationTypeBadge({ type, className }: LocationTypeBadgeProps) {
  const config = TYPE_CONFIGS[type] || TYPE_CONFIGS.inne;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ''}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
