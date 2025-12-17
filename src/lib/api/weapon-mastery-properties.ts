import { getSupabaseClient } from '@/lib/supabase';
import type { WeaponMasteryPropertyDTO } from '@/types';

/**
 * Get all weapon mastery properties
 * Weapon mastery properties are public reference data (no RLS needed)
 */
export async function getWeaponMasteryProperties(): Promise<WeaponMasteryPropertyDTO[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('weapon_mastery_properties')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Failed to fetch weapon mastery properties:', error);
    throw new Error(error.message);
  }

  return data as unknown as WeaponMasteryPropertyDTO[];
}

/**
 * Get a single weapon mastery property by ID
 */
export async function getWeaponMasteryProperty(propertyId: string): Promise<WeaponMasteryPropertyDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('weapon_mastery_properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Weapon mastery property not found');
    }
    console.error('Failed to fetch weapon mastery property:', error);
    throw new Error(error.message);
  }

  return data as unknown as WeaponMasteryPropertyDTO;
}
