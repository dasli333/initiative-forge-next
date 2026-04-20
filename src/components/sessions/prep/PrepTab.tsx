'use client';

import { OpeningSection } from './OpeningSection';
import { GoalsSection } from './GoalsSection';
import { EncountersSection } from './EncountersSection';
import { QuickLinksSection } from './QuickLinksSection';
import { NotesSection } from './NotesSection';
import type { PlanJson, SessionStatus } from '@/types/sessions';
import { createEmptyPlanJson } from '@/types/sessions';

interface PrepTabProps {
  planJson: PlanJson | null;
  isEditing: boolean;
  onChange: (planJson: PlanJson) => void;
  campaignId: string;
  sessionId: string;
  status: SessionStatus;
}

export function PrepTab({ planJson, isEditing, onChange, campaignId, sessionId, status }: PrepTabProps) {
  const plan = planJson || createEmptyPlanJson();

  const updatePlan = (field: keyof PlanJson, value: unknown) => {
    onChange({
      ...plan,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Quick Links — sticky horizontal strip */}
      <QuickLinksSection
        pinnedEntities={plan.pinned_entities}
        isEditing={isEditing}
        onChange={(pinnedEntities) => updatePlan('pinned_entities', pinnedEntities)}
        campaignId={campaignId}
      />

      {/* Goals + Encounters side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GoalsSection
          goals={plan.goals}
          isEditing={isEditing}
          onChange={(goals) => updatePlan('goals', goals)}
        />
        <EncountersSection
          encounters={plan.encounters}
          isEditing={isEditing}
          onChange={(encounters) => updatePlan('encounters', encounters)}
        />
      </div>

      {/* Notes — full width */}
      <NotesSection
        notes={plan.notes}
        isEditing={isEditing}
        onChange={(notes) => updatePlan('notes', notes)}
        campaignId={campaignId}
      />

      {/* Opening — moved to bottom, collapsible, default-collapsed mid-session */}
      <OpeningSection
        key={`opening-${sessionId}`}
        opening={plan.opening}
        isEditing={isEditing}
        onChange={(opening) => updatePlan('opening', opening)}
        campaignId={campaignId}
        status={status}
      />
    </div>
  );
}
