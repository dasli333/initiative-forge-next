'use client';

import { Home, Swords, Users } from 'lucide-react';
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
    </div>
  );
}
