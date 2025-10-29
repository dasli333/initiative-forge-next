import { getSupabaseClient } from '@/lib/supabase';
import type { MonsterDTO } from '@/types';

export interface FetchMonstersParams {
  searchQuery?: string;
  type?: string | null;
  size?: string | null;
  alignment?: string | null;
  limit?: number;
  offset?: number;
}

export interface ListMonstersResponse {
  monsters: MonsterDTO[];
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

  // Using `any` here is necessary due to TypeScript limitation with Supabase query builder
  // When chaining multiple conditional .eq()/.ilike() calls with reassignment,
  // TypeScript's type inference becomes "excessively deep and possibly infinite"
  // Type safety is maintained through the Promise<ListMonstersResponse> return type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queryBuilder: any = supabase.from('monsters').select('*', { count: 'exact' });

  // Apply filters
  if (searchQuery && searchQuery.trim()) {
    queryBuilder = queryBuilder.ilike('name', `%${searchQuery.trim()}%`);
  }

  if (type && type.trim()) {
    queryBuilder = queryBuilder.eq('type', type.trim());
  }

  if (size && size.trim()) {
    queryBuilder = queryBuilder.eq('size', size.trim());
  }

  if (alignment && alignment.trim()) {
    queryBuilder = queryBuilder.eq('alignment', alignment.trim());
  }

  // Apply pagination and execute query
  const { data, error, count } = await queryBuilder.range(offset, offset + limit - 1);

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
export async function getMonster(monsterId: string): Promise<MonsterDTO> {
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

  return data as unknown as MonsterDTO;
}
