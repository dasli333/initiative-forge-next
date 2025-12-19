'use client';

import { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  headerAction?: ReactNode;
}

export function SectionCard({ title, description, children, headerAction }: SectionCardProps) {
  return (
    <Card className="bg-muted/30 py-4">
      <CardHeader className="pb-2 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs">{description}</CardDescription>
            )}
          </div>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
}
