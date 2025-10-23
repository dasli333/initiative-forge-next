'use client';

import { Users, Swords } from 'lucide-react';
import { ActionCard } from './ActionCard';

interface QuickActionsSectionProps {
  campaignId: string;
}

/**
 * Quick actions section
 * Displays cards with quick links to main campaign features
 */
export function QuickActionsSection({ campaignId }: QuickActionsSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
          icon={<Users className="w-6 h-6" />}
          title="Player Characters"
          description="Manage your player characters, add new heroes, or update stats"
          buttonLabel="Manage Characters"
          buttonVariant="default"
          href={`/campaigns/${campaignId}/characters`}
        />
        <ActionCard
          icon={<Swords className="w-6 h-6" />}
          title="Combats"
          description="Start a new combat encounter and track initiative"
          buttonLabel="Start New Combat"
          buttonVariant="success"
          href={`/campaigns/${campaignId}/combats/new`}
        />
      </div>
    </section>
  );
}
