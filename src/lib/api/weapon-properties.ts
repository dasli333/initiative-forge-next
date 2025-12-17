import { getSupabaseClient } from '@/lib/supabase';
import type { WeaponPropertyDTO } from '@/types';

/**
 * Get all weapon properties
 * Weapon properties are public reference data (no RLS needed)
 */
export async function getWeaponProperties(): Promise<WeaponPropertyDTO[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('weapon_properties')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Failed to fetch weapon properties:', error);
    throw new Error(error.message);
  }

  return data as unknown as WeaponPropertyDTO[];
}

/**
 * Get a single weapon property by ID
 */
export async function getWeaponProperty(propertyId: string): Promise<WeaponPropertyDTO> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('weapon_properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Weapon property not found');
    }
    console.error('Failed to fetch weapon property:', error);
    throw new Error(error.message);
  }

  return data as unknown as WeaponPropertyDTO;
}
