import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RulesSectionView } from '@/components/rules/RulesSectionView';

interface RulesSectionPageProps {
  params: Promise<{ sectionId: string }>;
}

export default async function RulesSectionPage({ params }: RulesSectionPageProps) {
  const { sectionId } = await params;
  return (
    <ProtectedRoute>
      <RulesSectionView sectionId={sectionId} />
    </ProtectedRoute>
  );
}
