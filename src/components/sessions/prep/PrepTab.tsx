'use client';

import { OpeningSection } from './OpeningSection';
import { GoalsSection } from './GoalsSection';
import { EncountersSection } from './EncountersSection';
import { QuickLinksSection } from './QuickLinksSection';
import { NotesSection } from './NotesSection';
import type { PlanJson } from '@/types/sessions';
import { createEmptyPlanJson } from '@/types/sessions';

interface PrepTabProps {
  planJson: PlanJson | null;
  isEditing: boolean;
  onChange: (planJson: PlanJson) => void;
  campaignId: string;
}

export function PrepTab({ planJson, isEditing, onChange, campaignId }: PrepTabProps) {
  // Ensure we have a valid plan object
  const plan = planJson || createEmptyPlanJson();

  const updatePlan = (field: keyof PlanJson, value: unknown) => {
    onChange({
      ...plan,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Opening Section */}
      <OpeningSection
        opening={plan.opening}
        isEditing={isEditing}
        onChange={(opening) => updatePlan('opening', opening)}
        campaignId={campaignId}
      />

      {/* Goals Section */}
      <GoalsSection
        goals={plan.goals}
        isEditing={isEditing}
        onChange={(goals) => updatePlan('goals', goals)}
      />

      {/* Encounters Section */}
      <EncountersSection
        encounters={plan.encounters}
        isEditing={isEditing}
        onChange={(encounters) => updatePlan('encounters', encounters)}
      />

      {/* Quick Links Section */}
      <QuickLinksSection
        pinnedEntities={plan.pinned_entities}
        isEditing={isEditing}
        onChange={(pinnedEntities) => updatePlan('pinned_entities', pinnedEntities)}
        campaignId={campaignId}
      />

      {/* Notes Section */}
      <NotesSection
        notes={plan.notes}
        isEditing={isEditing}
        onChange={(notes) => updatePlan('notes', notes)}
        campaignId={campaignId}
      />
    </div>
  );
}
