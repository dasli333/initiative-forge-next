import { getSupabaseClient } from '@/lib/supabase';
import type { SpellDTO } from '@/types';

export interface FetchSpellsParams {
  searchQuery?: string;
  level?: number | null;
  class?: string | null;
  limit?: number;
  offset?: number;
}

export interface ListSpellsResponse {
  spells: SpellDTO[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Fetch spells with optional filtering and pagination
 * Spells are public data (no RLS needed)
 */
export async function getSpells(params: FetchSpellsParams = {}): Promise<ListSpellsResponse> {
  const supabase = getSupabaseClient();
  const {
    searchQuery,
    level,
    class: className,
    limit = 50,
    offset = 0,
  } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queryBuilder = supabase.from('spells').select('*', { count: 'exact' }) as any;

  // Apply filters
  if (searchQuery && searchQuery.trim()) {
    queryBuilder = queryBuilder.ilike('name', `%${searchQuery.trim()}%`);
  }

  if (level !== null && level !== undefined) {
    queryBuilder = queryBuilder.eq('level', level);
  }

  if (className && className.trim()) {
    queryBuilder = queryBuilder.contains('classes', [className.trim()]);
  }

  // Apply pagination and execute query
  const { data, error, count } = await queryBuilder.range(offset, offset + limit - 1);

  if (error) {
    console.error('Failed to fetch spells:', error);
    throw new Error(error.message);
  }

  return {
    spells: (data as unknown as SpellDTO[]) || [],
    total: count || 0,
    limit,
    offset,
  };
}

/**
 * Get a single spell by ID
 */
export async function getSpell(spellId: string): Promise<SpellDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('spells')
    .select('*')
    .eq('id', spellId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Spell not found');
    }
    console.error('Failed to fetch spell:', error);
    throw new Error(error.message);
  }

  return data as unknown as SpellDTO;
}
