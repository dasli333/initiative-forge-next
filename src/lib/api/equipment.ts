import { getSupabaseClient } from '@/lib/supabase';
import type { EquipmentDTO } from '@/types';

export interface FetchEquipmentParams {
  searchQuery?: string;
  category?: string | null;
  limit?: number;
  offset?: number;
}

export interface ListEquipmentResponse {
  equipment: EquipmentDTO[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Fetch equipment with optional filtering and pagination
 * Equipment are public data (no RLS needed)
 */
export async function getEquipment(params: FetchEquipmentParams = {}): Promise<ListEquipmentResponse> {
  const supabase = getSupabaseClient();
  const {
    searchQuery,
    category,
    limit = 50,
    offset = 0,
  } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queryBuilder = supabase.from('equipment').select('*', { count: 'exact' }) as any;

  // Apply filters
  if (searchQuery && searchQuery.trim()) {
    // Search in both name column and JSONB name fields
    queryBuilder = queryBuilder.or(`name.ilike.%${searchQuery.trim()}%,data->name->>en.ilike.%${searchQuery.trim()}%,data->name->>pl.ilike.%${searchQuery.trim()}%`);
  }

  if (category && category.trim()) {
    // Filter by category using JSONB contains operator
    // Check if any item in equipment_categories array has matching id
    queryBuilder = queryBuilder.contains('data->equipment_categories', [{ id: category.trim() }]);
  }

  // Apply pagination and execute query
  const { data, error, count } = await queryBuilder
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Failed to fetch equipment:', error);
    throw new Error(error.message);
  }

  return {
    equipment: (data as unknown as EquipmentDTO[]) || [],
    total: count || 0,
    limit,
    offset,
  };
}

/**
 * Get a single equipment item by ID
 */
export async function getEquipmentItem(equipmentId: string): Promise<EquipmentDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', equipmentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Equipment not found');
    }
    console.error('Failed to fetch equipment:', error);
    throw new Error(error.message);
  }

  return data as unknown as EquipmentDTO;
}

/**
 * Get equipment by category (e.g., "weapons", "armor", "adventuring-gear")
 */
export async function getEquipmentByCategory(category: string): Promise<EquipmentDTO[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .contains('data->equipment_categories', [{ id: category }])
    .order('name', { ascending: true });

  if (error) {
    console.error(`Failed to fetch equipment for category ${category}:`, error);
    throw new Error(error.message);
  }

  return (data as unknown as EquipmentDTO[]) || [];
}
