'use client';

import { EquipmentLibraryView } from '@/components/equipment';
import { ProtectedRoute } from '@/components/ProtectedRoute';

/**
 * Equipment Library Page
 *
 * Displays a comprehensive library of D&D 5e equipment with:
 * - Search functionality
 * - Category filter
 * - Infinite scroll pagination
 * - Detailed equipment information (weapons, armor, tools, gear)
 * - Hover tooltips for weapon properties and mastery properties
 *
 * This is a client-side rendered page that uses React Query
 * for data fetching and caching (no SSR prefetch needed in SPA mode)
 */
export default function EquipmentPage() {
  return (
    <ProtectedRoute>
      <EquipmentLibraryView />
    </ProtectedRoute>
  );
}
