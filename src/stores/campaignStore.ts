import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Campaign } from '@/types';

interface CampaignStore {
  // State - full campaign object and ID for UI display
  selectedCampaignId: string | null;
  selectedCampaign: Campaign | null;

  // Actions
  setSelectedCampaignId: (id: string | null) => void;
  setSelectedCampaign: (campaign: Campaign | null) => void;
  clearSelection: () => void;
}

/**
 * Global store for managing the currently selected campaign
 * This store is used across the entire application to know which campaign is active
 *
 * Design decisions:
 * - Stores both campaign ID and full campaign object for UI display
 * - Components that fetch campaign data should update this store
 * - Sidebar reads only from store (no fetching) for instant display
 * - Only persists campaign name to localStorage (not all data)
 */
export const useCampaignStore = create<CampaignStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        selectedCampaignId: null,
        selectedCampaign: null,

        // Actions
        setSelectedCampaignId: (id) => set({ selectedCampaignId: id }, false, 'setSelectedCampaignId'),

        setSelectedCampaign: (campaign) =>
          set(
            {
              selectedCampaign: campaign,
              selectedCampaignId: campaign?.id || null,
            },
            false,
            'setSelectedCampaign'
          ),

        clearSelection: () => set({ selectedCampaignId: null, selectedCampaign: null }, false, 'clearSelection'),
      }),
      {
        name: 'campaign-storage', // name for localStorage key
        partialize: (state) => ({
          // Persist only ID and name (not all campaign data)
          selectedCampaignId: state.selectedCampaignId,
          selectedCampaign: state.selectedCampaign
            ? {
                id: state.selectedCampaign.id,
                name: state.selectedCampaign.name,
              }
            : null,
        }),
      }
    ),
    {
      name: 'campaign-store',
    }
  )
);
