'use client';

import Link from 'next/link';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  buttonVariant?: 'default' | 'success';
  href: string;
}

/**
 * Action card component
 * Displays a quick action with icon, title, description, and CTA button
 */
export function ActionCard({
  icon,
  title,
  description,
  buttonLabel,
  buttonVariant = 'default',
  href,
}: ActionCardProps) {
  const buttonClasses = buttonVariant === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : '';

  return (
    <Card className="hover:border-emerald-600 transition-colors">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-muted">{icon}</div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className={buttonClasses}>
          <Link href={href}>{buttonLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
