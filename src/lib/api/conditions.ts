import { getSupabaseClient } from '@/lib/supabase';
import type { Condition } from '@/types';

/**
 * Get all conditions
 * Conditions are public reference data (no RLS needed)
 */
export async function getConditions(): Promise<Condition[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('conditions')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Failed to fetch conditions:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get a single condition by ID
 */
export async function getCondition(conditionId: string): Promise<Condition> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('conditions')
    .select('*')
    .eq('id', conditionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Condition not found');
    }
    console.error('Failed to fetch condition:', error);
    throw new Error(error.message);
  }

  return data;
}
