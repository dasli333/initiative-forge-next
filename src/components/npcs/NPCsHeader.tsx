'use client';

import { Button } from '@/components/ui/button';
import { Plus, Tags } from 'lucide-react';

interface NPCsHeaderProps {
  campaignName: string;
  onAddClick: () => void;
  onManageTagsClick: () => void;
}

/**
 * Header component for NPCs page
 * - Breadcrumb: My Campaigns → [Campaign Name] → NPCs
 * - H1: "NPCs"
 * - Actions: "Manage Tags" and "Add NPC" buttons
 * - Filters moved to NPCsList component (compact filters)
 */
export function NPCsHeader({
  campaignName,
  onAddClick,
  onManageTagsClick,
}: NPCsHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <a href="/campaigns" className="hover:text-foreground transition-colors">
          My Campaigns
        </a>
        <span>→</span>
        <span className="text-foreground">{campaignName}</span>
        <span>→</span>
        <span className="text-foreground font-medium">NPCs</span>
      </nav>

      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">NPCs</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onManageTagsClick}>
            <Tags className="h-4 w-4 mr-2" />
            Manage Tags
          </Button>
          <Button onClick={onAddClick} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Add NPC
          </Button>
        </div>
      </div>
    </div>
  );
}
