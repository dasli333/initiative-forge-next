import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Campaign base type from database
 */
export type Campaign = Tables<'campaigns'>;

/**
 * Campaign DTO
 * Currently identical to Campaign (no Json fields to transform)
 * Separated for future-proofing when Campaign might include:
 * - Rich text fields (description_json, notes_json)
 * - Settings/preferences (settings_json)
 * - Metadata (tags, custom fields)
 */
export type CampaignDTO = Campaign;

// ============================================================================
// COMMAND MODELS
// ============================================================================

/**
 * Create campaign command (POST /api/campaigns)
 * Only name is required - user_id is added server-side from auth context
 */
export type CreateCampaignCommand = Pick<TablesInsert<'campaigns'>, 'name'>;

/**
 * Update campaign command (PATCH /api/campaigns/:id)
 * Only name can be updated
 */
export type UpdateCampaignCommand = Pick<TablesUpdate<'campaigns'>, 'name'>;

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filters for querying campaigns
 */
export interface CampaignFilters {
  search?: string;
}

// ============================================================================
// VIEW MODELS
// ============================================================================

/**
 * Campaign ViewModel for UI display
 * Enriched with computed data for UI components
 * Currently identical to CampaignDTO, separated for future extensions
 */
export type CampaignViewModel = CampaignDTO;
