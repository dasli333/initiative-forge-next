'use client';

import type { QuestDetailsViewModel } from '@/types/quests';

interface RelatedTabProps {
  viewModel: QuestDetailsViewModel;
  campaignId: string;
}

export function RelatedTab({ viewModel, campaignId: _campaignId }: RelatedTabProps) {
  return (
    <div className="space-y-6">
      {/* Related Entities (auto-extracted from @mentions) */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Related Entities</h3>

        {viewModel.relatedEntities.length === 0 ? (
          <div className="rounded bg-muted p-4 text-sm text-muted-foreground">
            No entities mentioned in quest description. Use @mentions to link NPCs, locations, and
            other entities.
          </div>
        ) : (
          <div className="space-y-4">
            {/* TODO: Group entities by type and render */}
            <div className="text-sm text-muted-foreground">
              {viewModel.relatedEntities.length} related entities (feature in progress)
            </div>
          </div>
        )}
      </div>

      {/* Backlinks (\"Mentioned In\") */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Mentioned In</h3>

        {viewModel.backlinks.length === 0 ? (
          <div className="rounded bg-muted p-4 text-sm text-muted-foreground">
            This quest hasn&apos;t been mentioned in any other entities yet.
          </div>
        ) : (
          <div className="space-y-2">
            {/* TODO: Render backlinks */}
            <div className="text-sm text-muted-foreground">
              {viewModel.backlinks.length} backlinks (feature in progress)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
