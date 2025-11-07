'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, X } from 'lucide-react';
import { StoryTab } from './tabs/StoryTab';
import { CombatTab } from './tabs/CombatTab';
import { RelationshipsTab } from './tabs/RelationshipsTab';
import type { NPCDetailsViewModel } from '@/types/npcs';
import type { UpdateNPCCommand } from '@/types/npcs';
import type { UpsertNPCCombatStatsCommand } from '@/types/npc-combat-stats';
import type { UpdateNPCRelationshipCommand } from '@/types/npc-relationships';

interface NPCDetailSlideoverProps {
  npcId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  viewModel: NPCDetailsViewModel | undefined;
  campaignId: string;
  factions: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  isLoading: boolean;
  onFieldUpdate: (field: string, value: unknown) => void;
  onAddCombatStats: () => void;
  onUpdateCombatStats: (command: UpsertNPCCombatStatsCommand) => void;
  onRemoveCombatStats: () => void;
  onUpdateRelationship: (relationshipId: string, command: UpdateNPCRelationshipCommand) => void;
  onDeleteRelationship: (relationshipId: string) => void;
  onAddRelationship: () => void;
  isUpdating?: boolean;
}

/**
 * Slideover component for NPC details
 * - Shadcn Sheet (side="right", width 600px)
 * - Header: NPC name (H2), Edit button, Close button
 * - Shadcn Tabs: Story | Combat | Relationships
 * - Renders: StoryTab, CombatTab, RelationshipsTab
 */
export function NPCDetailSlideover({
  npcId,
  isOpen,
  onClose,
  onEdit,
  viewModel,
  campaignId,
  factions,
  locations,
  isLoading,
  onFieldUpdate,
  onAddCombatStats,
  onUpdateCombatStats,
  onRemoveCombatStats,
  onUpdateRelationship,
  onDeleteRelationship,
  onAddRelationship,
  isUpdating = false,
}: NPCDetailSlideoverProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading || !viewModel ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            {/* Header */}
            <DialogHeader className="space-y-4 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-2xl font-bold truncate">
                    {viewModel.npc.name}
                  </DialogTitle>
                  {viewModel.npc.role && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {viewModel.npc.role}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEdit}
                    disabled={isUpdating}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Tabs */}
            <Tabs defaultValue="story" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="story">Story</TabsTrigger>
                <TabsTrigger value="combat">Combat</TabsTrigger>
                <TabsTrigger value="relationships">Relationships</TabsTrigger>
              </TabsList>

              <TabsContent value="story" className="mt-6">
                <StoryTab
                  viewModel={viewModel}
                  campaignId={campaignId}
                  factions={factions}
                  locations={locations}
                  onFieldUpdate={onFieldUpdate}
                  isUpdating={isUpdating}
                />
              </TabsContent>

              <TabsContent value="combat" className="mt-6">
                <CombatTab
                  viewModel={viewModel}
                  campaignId={campaignId}
                  onAddStats={onAddCombatStats}
                  onUpdateStats={onUpdateCombatStats}
                  onRemoveStats={onRemoveCombatStats}
                  isUpdating={isUpdating}
                />
              </TabsContent>

              <TabsContent value="relationships" className="mt-6">
                <RelationshipsTab
                  viewModel={viewModel}
                  onUpdateRelationship={onUpdateRelationship}
                  onDeleteRelationship={onDeleteRelationship}
                  onAddRelationship={onAddRelationship}
                  isUpdating={isUpdating}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
