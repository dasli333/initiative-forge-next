'use client';

import { SummarySection } from './SummarySection';
import { KeyEventsSection } from './KeyEventsSection';
import { RewardsSection } from './RewardsSection';
import type { LogJson } from '@/types/sessions';
import { createEmptyLogJson } from '@/types/sessions';

interface JournalTabProps {
  logJson: LogJson | null;
  isEditing: boolean;
  onChange: (logJson: LogJson) => void;
  campaignId: string;
}

export function JournalTab({ logJson, isEditing, onChange, campaignId }: JournalTabProps) {
  // Ensure we have a valid log object
  const log = logJson || createEmptyLogJson();

  const updateLog = (field: keyof LogJson, value: unknown) => {
    onChange({
      ...log,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <SummarySection
        summary={log.summary}
        isEditing={isEditing}
        onChange={(summary) => updateLog('summary', summary)}
        campaignId={campaignId}
      />

      {/* Key Events Section */}
      <KeyEventsSection
        keyEvents={log.key_events}
        isEditing={isEditing}
        onChange={(keyEvents) => updateLog('key_events', keyEvents)}
      />

      {/* Rewards Section */}
      <RewardsSection
        lootGiven={log.loot_given}
        xpGiven={log.xp_given}
        isEditing={isEditing}
        onLootChange={(lootGiven) => updateLog('loot_given', lootGiven)}
        onXpChange={(xpGiven) => updateLog('xp_given', xpGiven)}
      />
    </div>
  );
}
