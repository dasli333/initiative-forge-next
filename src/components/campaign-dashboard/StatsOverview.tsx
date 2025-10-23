'use client';

import { Users } from 'lucide-react';
import { StatCard } from './StatCard';

interface StatsOverviewProps {
  charactersCount: number;
}

/**
 * Stats overview section
 * Displays campaign statistics in a responsive grid
 */
export function StatsOverview({ charactersCount }: StatsOverviewProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Campaign Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Player Characters"
          value={charactersCount}
          colorClass="text-emerald-600"
        />
        {/* Future stats cards can be added here */}
      </div>
    </section>
  );
}
