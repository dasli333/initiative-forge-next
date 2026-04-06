'use client';

import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sizeConfig = {
  sm: {
    container: 'h-full',
    icon: 'h-16 w-16',
    title: 'text-lg',
    description: 'text-sm',
  },
  md: {
    container: 'min-h-[400px]',
    icon: 'h-16 w-16',
    title: 'text-2xl',
    description: 'text-base',
  },
  lg: {
    container: 'min-h-[60vh]',
    icon: 'w-24 h-24',
    title: 'text-3xl',
    description: 'text-lg',
  },
} as const;

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  'data-testid'?: string;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  size?: keyof typeof sizeConfig;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = 'sm',
  className,
}: EmptyStateProps) {
  const config = sizeConfig[size];

  return (
    <div className={cn('flex flex-col items-center justify-center text-center px-6', config.container, className)}>
      <Icon className={cn('text-muted-foreground mb-4', config.icon)} />
      <h3 className={cn('font-semibold mb-2', config.title)}>{title}</h3>
      <p className={cn('text-muted-foreground max-w-sm', config.description)}>{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          size={size === 'lg' ? 'lg' : 'default'}
          className="bg-emerald-600 hover:bg-emerald-700 mt-6"
          data-testid={action['data-testid']}
        >
          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
