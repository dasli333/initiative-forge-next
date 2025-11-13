import type { Campaign } from '@/types';
import type { CampaignViewModel } from '@/types/campaigns';

/**
 * Transforms a Campaign to CampaignViewModel
 *
 * Currently a passthrough, but provides centralized transformation point
 * for future extensions (e.g., computed fields, formatting)
 *
 * @param campaign - The campaign from database
 * @returns CampaignViewModel
 */
export function transformToCampaignViewModel(campaign: Campaign): CampaignViewModel {
  return campaign;
}

/**
 * Transforms an array of Campaigns to CampaignViewModels
 *
 * @param campaigns - Array of campaigns from database
 * @returns Array of CampaignViewModels
 */
export function transformToCampaignViewModels(campaigns: Campaign[]): CampaignViewModel[] {
  return campaigns.map(transformToCampaignViewModel);
}
