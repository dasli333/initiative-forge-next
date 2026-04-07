'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDebouncedValue } from '@/components/hooks/useDebouncedValue';
import { RulesHeader } from './RulesHeader';
import { RulesSectionGrid } from './RulesSectionGrid';

export function RulesReferenceView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebouncedValue(searchQuery, 200);

  const handleSearchResultNavigate = (sectionId: string, subsectionId: string) => {
    router.push(`/rules/${sectionId}#${subsectionId}`);
  };

  return (
    <div>
      <RulesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        debouncedQuery={debouncedQuery}
        onResultNavigate={handleSearchResultNavigate}
      />
      <RulesSectionGrid />
    </div>
  );
}
