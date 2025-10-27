import { getSupabaseClient } from '@/lib/supabase';
import type { Monster } from '@/types';

export interface FetchMonstersParams {
  searchQuery?: string;
  type?: string | null;
  size?: string | null;
  alignment?: string | null;
  limit?: number;
  offset?: number;
}

export interface ListMonstersResponse {
  monsters: Monster[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Fetch monsters with optional filtering and pagination
 * Monsters are public data (no RLS needed)
 */
export async function getMonsters(params: FetchMonstersParams = {}): Promise<ListMonstersResponse> {
  const supabase = getSupabaseClient();
  const {
    searchQuery,
    type,
    size,
    alignment,
    limit = 50,
    offset = 0,
  } = params;

  // Build query - TypeScript has issues with deep query chain typing in Supabase
  // Using pragmatic approach: dynamic query building with runtime type safety
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase.from('monsters').select('*', { count: 'exact' });

  // Apply filters
  if (searchQuery && searchQuery.trim()) {
    query = query.ilike('name', `%${searchQuery.trim()}%`);
  }

  if (type && type.trim()) {
    query = query.eq('type', type.trim());
  }

  if (size && size.trim()) {
    query = query.eq('size', size.trim());
  }

  if (alignment && alignment.trim()) {
    query = query.eq('alignment', alignment.trim());
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  // Execute query - return type is properly typed through Promise<ListMonstersResponse>
  const { data, error, count } = await query;

  if (error) {
    console.error('Failed to fetch monsters:', error);
    throw new Error(error.message);
  }

  return {
    monsters: data || [],
    total: count || 0,
    limit,
    offset,
  };
}

/**
 * Get a single monster by ID
 */
export async function getMonster(monsterId: string): Promise<Monster> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('monsters')
    .select('*')
    .eq('id', monsterId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Monster not found');
    }
    console.error('Failed to fetch monster:', error);
    throw new Error(error.message);
  }

  return data;
}
