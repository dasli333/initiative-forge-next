'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading state component with skeleton placeholders
 * Displays while campaigns are being fetched from the database
 */
export function LoadingState() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
