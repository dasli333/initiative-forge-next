'use client';

import { RulesReferenceView } from '@/components/rules/RulesReferenceView';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function RulesPage() {
  return (
    <ProtectedRoute>
      <RulesReferenceView />
    </ProtectedRoute>
  );
}
