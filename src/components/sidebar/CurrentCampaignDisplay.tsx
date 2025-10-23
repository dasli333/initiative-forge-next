'use client';

import Link from 'next/link';
import type { Campaign } from '@/types';

interface CurrentCampaignDisplayProps {
  campaign: Campaign | null;
  isLoading: boolean;
}

export function CurrentCampaignDisplay({ campaign, isLoading }: CurrentCampaignDisplayProps) {
  if (isLoading) {
    return (
      <div className="px-4 py-3 border-b border-slate-800">
        <label className="text-xs uppercase text-slate-400 mb-2 block font-semibold tracking-wider">
          Current Campaign
        </label>
        <div className="text-slate-400 text-sm">Loading campaign...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-b border-slate-800" data-testid="current-campaign-display">
      <label className="text-xs uppercase text-slate-400 mb-2 block font-semibold tracking-wider">
        Current Campaign
      </label>
      {campaign ? (
        <h2 className="text-slate-200 font-semibold truncate" data-testid="current-campaign-name">
          {campaign.name}
        </h2>
      ) : (
        <Link
          href="/campaigns"
          className="text-slate-200 font-semibold truncate block hover:text-emerald-400 transition-colors"
          data-testid="select-campaign-link"
        >
          Select a campaign
        </Link>
      )}
    </div>
  );
}
