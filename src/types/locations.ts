import type { Tables } from '@/types/database';
import type { JSONContent } from '@tiptap/react';

// ============================================================================
// ENTITY TYPES
// ============================================================================

export type Location = Tables<'locations'>;

/**
 * Coordinates structure for locations
 */
export interface LocationCoordinates {
  lat: number;
  lng: number;
}

/**
 * Location DTO with typed Json fields
 */
export interface LocationDTO extends Omit<Location, 'description_json' | 'coordinates_json'> {
  description_json: JSONContent | null;
  coordinates_json: LocationCoordinates | null;
}

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
  description_json?: JSONContent | null; // Rich text with @mentions
  parent_location_id?: string | null;
  image_url?: string | null;
  coordinates_json?: LocationCoordinates | null; // {lat: number, lng: number}
}

/**
 * Update location command
 * All fields are optional for partial updates
 */
export interface UpdateLocationCommand {
  name?: string;
  location_type?: string;
  description_json?: JSONContent | null;
  parent_location_id?: string | null;
  image_url?: string | null;
  coordinates_json?: LocationCoordinates | null;
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
