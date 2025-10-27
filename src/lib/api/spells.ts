import { getSupabaseClient } from '@/lib/supabase';
import type { Spell } from '@/types';

export interface FetchSpellsParams {
  searchQuery?: string;
  level?: number | null;
  class?: string | null;
  limit?: number;
  offset?: number;
}

export interface ListSpellsResponse {
  spells: Spell[];
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

  // Build query - TypeScript has issues with deep query chain typing in Supabase
  // Using pragmatic approach: dynamic query building with runtime type safety
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase.from('spells').select('*', { count: 'exact' });

  // Apply filters
  if (searchQuery && searchQuery.trim()) {
    query = query.ilike('name', `%${searchQuery.trim()}%`);
  }

  if (level !== null && level !== undefined) {
    query = query.eq('level', level);
  }

  if (className && className.trim()) {
    query = query.contains('classes', [className.trim()]);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  // Execute query - return type is properly typed through Promise<ListSpellsResponse>
  const { data, error, count } = await query;

  if (error) {
    console.error('Failed to fetch spells:', error);
    throw new Error(error.message);
  }

  return {
    spells: data || [],
    total: count || 0,
    limit,
    offset,
  };
}

/**
 * Get a single spell by ID
 */
export async function getSpell(spellId: string): Promise<Spell> {
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

  return data;
}
