import { getSupabaseClient } from '@/lib/supabase';
import type { Json } from '@/types/database';
import type { LocationDTO, CreateLocationCommand, UpdateLocationCommand, LocationFilters } from '@/types/locations';

/**
 * Get all locations for a campaign with optional filtering
 * Sorted by created_at descending (newest first)
 */
export async function getLocations(
  campaignId: string,
  filters?: LocationFilters
): Promise<LocationDTO[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('locations')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.location_type) {
    query = query.eq('location_type', filters.location_type);
  }

  if (filters?.parent_location_id !== undefined) {
    if (filters.parent_location_id === null) {
      query = query.is('parent_location_id', null);
    } else {
      query = query.eq('parent_location_id', filters.parent_location_id);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch locations:', error);
    throw new Error(error.message);
  }

  return data as unknown as LocationDTO[];
}

/**
 * Get a single location by ID
 * RLS will ensure user can only access locations from their campaigns
 */
export async function getLocation(locationId: string): Promise<LocationDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', locationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Location not found');
    }
    console.error('Failed to fetch location:', error);
    throw new Error(error.message);
  }

  return data as unknown as LocationDTO;
}

/**
 * Create a new location
 * campaign_id is required for RLS
 */
export async function createLocation(
  campaignId: string,
  command: CreateLocationCommand
): Promise<LocationDTO> {
  const supabase = getSupabaseClient();

  // Get current user for auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('locations')
    .insert({
      campaign_id: campaignId,
      name: command.name,
      location_type: command.location_type,
      description_json: (command.description_json as unknown as Json) || null,
      parent_location_id: command.parent_location_id || null,
      image_url: command.image_url || null,
      coordinates_json: (command.coordinates_json as unknown as Json) || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create location:', error);
    throw new Error(error.message);
  }

  return data as unknown as LocationDTO;
}

/**
 * Update a location
 * RLS will ensure user can only update locations from their campaigns
 */
export async function updateLocation(
  locationId: string,
  command: UpdateLocationCommand
): Promise<LocationDTO> {
  const supabase = getSupabaseClient();

  const updateData: Record<string, unknown> = {};

  if (command.name !== undefined) updateData.name = command.name;
  if (command.location_type !== undefined) updateData.location_type = command.location_type;
  if (command.description_json !== undefined) updateData.description_json = command.description_json;
  if (command.parent_location_id !== undefined) updateData.parent_location_id = command.parent_location_id;
  if (command.image_url !== undefined) updateData.image_url = command.image_url;
  if (command.coordinates_json !== undefined) updateData.coordinates_json = command.coordinates_json;

  const { data, error } = await supabase
    .from('locations')
    .update(updateData)
    .eq('id', locationId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Location not found');
    }
    console.error('Failed to update location:', error);
    throw new Error(error.message);
  }

  return data as unknown as LocationDTO;
}

/**
 * Delete a location
 * RLS will ensure user can only delete locations from their campaigns
 * Child locations will have parent_location_id set to NULL (ON DELETE SET NULL)
 */
export async function deleteLocation(locationId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', locationId);

  if (error) {
    console.error('Failed to delete location:', error);
    throw new Error(error.message);
  }
}
