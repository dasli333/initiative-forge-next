import type { Campaign } from '@/types';

/**
 * Extended Campaign ViewModel with aggregated data for UI display
 *
 * In MVP, characterCount, combatCount, and hasActiveCombat are optional
 * and may be set to 0/false or fetched separately in future iterations
 */
export interface CampaignViewModel extends Campaign {
  /** Number of characters in this campaign (optional in MVP) */
  characterCount?: number;

  /** Number of combats in this campaign (optional in MVP) */
  combatCount?: number;

  /** Whether this campaign has an active combat (optional in MVP) */
  hasActiveCombat?: boolean;
}
