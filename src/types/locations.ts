import type { Json, Tables } from '@/types/database';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type Location = Tables<'locations'>;

// ============================================================================
// COMMAND MODELS
// ============================================================================

/**
 * Create location command
 * campaign_id is passed separately in API function
 */
export interface CreateLocationCommand {
  name: string;
  location_type: string;
  description_json?: Json | null; // Rich text with @mentions
  parent_location_id?: string | null;
  image_url?: string | null;
  coordinates_json?: Json | null; // {lat: number, lng: number}
}

/**
 * Update location command
 * All fields are optional for partial updates
 */
export interface UpdateLocationCommand {
  name?: string;
  location_type?: string;
  description_json?: Json | null;
  parent_location_id?: string | null;
  image_url?: string | null;
  coordinates_json?: Json | null;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filters for querying locations
 */
export interface LocationFilters {
  location_type?: string;
  parent_location_id?: string | null;
}
