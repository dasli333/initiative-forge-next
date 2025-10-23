'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  isDisabled?: boolean;
  badge?: {
    text: string;
    variant: 'default' | 'destructive';
    animate?: boolean;
  };
}

export function NavItem({ icon: Icon, label, href, isActive, isDisabled, badge }: NavItemProps) {
  const baseClasses = cn(
    'flex items-center gap-3 px-4 py-2 text-sm transition-colors relative',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
  );

  const stateClasses = cn({
    'border-l-2 border-emerald-500 text-emerald-500 bg-slate-800/50': isActive,
    'opacity-50 cursor-not-allowed pointer-events-none': isDisabled,
    'text-slate-300 hover:bg-slate-800 hover:text-slate-100': !isActive && !isDisabled,
  });

  // Generate test ID from label (e.g., "Player Characters" -> "nav-player-characters")
  const testId = `nav-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const content = (
    <>
      <Icon className="h-4 w-4" />
      <span className="flex-1">{label}</span>
      {badge && (
        <Badge
          variant={badge.variant}
          className={cn({
            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': badge.variant === 'default',
            'animate-pulse': badge.animate,
          })}
        >
          {badge.text}
        </Badge>
      )}
    </>
  );

  if (isDisabled) {
    return (
      <li>
        <span className={cn(baseClasses, stateClasses)} data-testid={testId} aria-disabled="true">
          {content}
        </span>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        className={cn(baseClasses, stateClasses)}
        data-testid={testId}
        aria-current={isActive ? 'page' : undefined}
      >
        {content}
      </Link>
    </li>
  );
}
