'use client';

import { MonstersLibraryView } from '@/components/monsters/MonstersLibraryView';
import { ProtectedRoute } from '@/components/ProtectedRoute';

/**
 * Monsters Library Page
 *
 * Displays a comprehensive library of D&D 5e monsters with:
 * - Search functionality
 * - Filters (type, size, alignment)
 * - Infinite scroll pagination
 * - Detailed monster stats and abilities
 *
 * This is a client-side rendered page that uses React Query
 * for data fetching and caching (no SSR prefetch needed in SPA mode)
 */
export default function MonstersPage() {
  return (
    <ProtectedRoute>
      <MonstersLibraryView />
    </ProtectedRoute>
  );
}
