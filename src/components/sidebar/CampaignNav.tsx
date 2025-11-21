'use client';

import {
  Home,
  Swords,
  Users,
  Map,
  UserSquare,
  Scroll,
  BookText,
  Shield,
  BookOpen,
  Package,
  Clock
} from 'lucide-react';
import { NavItem } from './NavItem';

interface CampaignNavProps {
  selectedCampaignId: string | null;
  currentPath: string;
}

export function CampaignNav({ selectedCampaignId, currentPath }: CampaignNavProps) {
  if (!selectedCampaignId) {
    return null;
  }

  const campaignHomeHref = `/campaigns/${selectedCampaignId}`;
  const combatHref = `/campaigns/${selectedCampaignId}/combats`;
  const charactersHref = `/campaigns/${selectedCampaignId}/characters`;
  const locationsHref = `/campaigns/${selectedCampaignId}/locations`;
  const npcsHref = `/campaigns/${selectedCampaignId}/npcs`;
  const questsHref = `/campaigns/${selectedCampaignId}/quests`;
  const storyArcsHref = `/campaigns/${selectedCampaignId}/story-arcs`;
  const factionsHref = `/campaigns/${selectedCampaignId}/factions`;
  const loreNotesHref = `/campaigns/${selectedCampaignId}/lore-notes`;

  return (
    <div className="mt-6 space-y-1" data-testid="campaign-nav">
      <h2 className="px-4 text-xs uppercase text-slate-500 mb-2 font-semibold tracking-wider">Campaign</h2>
      <ul role="list" className="space-y-1">
        <NavItem
          icon={Home}
          label="Campaign Home"
          href={campaignHomeHref}
          isActive={currentPath === campaignHomeHref}
        />
        <NavItem
          icon={Swords}
          label="Combat"
          href={combatHref}
          isActive={currentPath === combatHref || currentPath.startsWith('/combats/')}
        />
        <NavItem
          icon={Users}
          label="Player Characters"
          href={charactersHref}
          isActive={currentPath === charactersHref || currentPath.startsWith(charactersHref + '/')}
        />
      </ul>

      <h2 className="px-4 text-xs uppercase text-slate-500 mt-6 mb-2 font-semibold tracking-wider">
        World Building
      </h2>
      <ul role="list" className="space-y-1">
        <NavItem
          icon={Map}
          label="Locations"
          href={locationsHref}
          isActive={currentPath === locationsHref || currentPath.startsWith(locationsHref + '/')}
        />
        <NavItem
          icon={UserSquare}
          label="NPCs"
          href={npcsHref}
          isActive={currentPath === npcsHref || currentPath.startsWith(npcsHref + '/')}
        />
        <NavItem
          icon={Scroll}
          label="Quests"
          href={questsHref}
          isActive={currentPath === questsHref || currentPath.startsWith(questsHref + '/')}
        />
        <NavItem
          icon={BookText}
          label="Story Arcs"
          href={storyArcsHref}
          isActive={currentPath === storyArcsHref || currentPath.startsWith(storyArcsHref + '/')}
        />
        <NavItem
          icon={Shield}
          label="Factions"
          href={factionsHref}
          isActive={currentPath === factionsHref || currentPath.startsWith(factionsHref + '/')}
        />
        <NavItem
          icon={BookOpen}
          label="Lore Notes"
          href={loreNotesHref}
          isActive={currentPath === loreNotesHref || currentPath.startsWith(loreNotesHref + '/')}
        />
        <NavItem
          icon={Package}
          label="Story Items"
          href="#"
          isActive={false}
          isDisabled
          badge={{ text: 'Soon', variant: 'default' }}
        />
        <NavItem
          icon={Clock}
          label="Timeline"
          href="#"
          isActive={false}
          isDisabled
          badge={{ text: 'Soon', variant: 'default' }}
        />
      </ul>
    </div>
  );
}
