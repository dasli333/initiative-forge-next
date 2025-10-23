import type { Campaign } from '@/types';
import type { CampaignViewModel } from '@/types/campaigns';

/**
 * Transforms a Campaign to CampaignViewModel
 *
 * This utility provides a centralized place for campaign data transformation,
 * ensuring consistency across the application.
 *
 * Note: Currently sets aggregated data (characterCount, combatCount, hasActiveCombat)
 * to default values. These could be populated from API in the future if needed.
 *
 * @param campaign - The campaign from database
 * @returns CampaignViewModel with default aggregated data
 */
export function transformToCampaignViewModel(campaign: Campaign): CampaignViewModel {
  return {
    ...campaign,
    characterCount: 0,
    combatCount: 0,
    hasActiveCombat: false,
  };
}

/**
 * Transforms an array of Campaigns to CampaignViewModels
 *
 * @param campaigns - Array of campaigns from database
 * @returns Array of CampaignViewModels with default aggregated data
 */
export function transformToCampaignViewModels(campaigns: Campaign[]): CampaignViewModel[] {
  return campaigns.map(transformToCampaignViewModel);
}
