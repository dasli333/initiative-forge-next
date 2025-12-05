import type { CampaignDTO, CampaignViewModel } from '@/types/campaigns';

/**
 * Transforms a CampaignDTO to CampaignViewModel
 *
 * Currently a passthrough, but provides centralized transformation point
 * for future extensions (e.g., computed fields, formatting)
 *
 * @param campaign - The campaign DTO from API
 * @returns CampaignViewModel
 */
export function transformToCampaignViewModel(campaign: CampaignDTO): CampaignViewModel {
  return campaign;
}

/**
 * Transforms an array of CampaignDTOs to CampaignViewModels
 *
 * @param campaigns - Array of campaign DTOs from API
 * @returns Array of CampaignViewModels
 */
export function transformToCampaignViewModels(campaigns: CampaignDTO[]): CampaignViewModel[] {
  return campaigns.map(transformToCampaignViewModel);
}
