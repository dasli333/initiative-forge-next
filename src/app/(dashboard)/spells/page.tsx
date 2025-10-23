'use client';

import { SpellsLibraryView } from '@/components/spells/SpellsLibraryView';
import { ProtectedRoute } from '@/components/ProtectedRoute';

/**
 * Spells Library Page
 *
 * Displays a comprehensive library of D&D 5e spells with:
 * - Search functionality
 * - Filters (level 0-9, class)
 * - Infinite scroll pagination
 * - Detailed spell descriptions, components, and effects
 *
 * This is a client-side rendered page that uses React Query
 * for data fetching and caching (no SSR prefetch needed in SPA mode)
 */
export default function SpellsPage() {
  return (
    <ProtectedRoute>
      <SpellsLibraryView />
    </ProtectedRoute>
  );
}
