import { getSupabaseClient } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';

/**
 * Compress image to WebP format
 */
async function compressImageToWebP(file: File, maxSizeMB: number): Promise<File> {
  const options = {
    maxSizeMB,
    useWebWorker: true,
    fileType: 'image/webp' as const,
  };
  return await imageCompression(file, options);
}

/**
 * Upload location image to Supabase Storage with WebP compression
 * @param campaignId - Campaign ID for folder structure
 * @param file - Image file to upload
 * @returns Public URL of uploaded image
 */
export async function uploadLocationImage(
  campaignId: string,
  file: File
): Promise<string> {
  const supabase = getSupabaseClient();

  // 1. Client-side compression to WebP (max 5 MB)
  const compressedFile = await compressImageToWebP(file, 5);

  // 2. Upload to Supabase Storage
  const fileName = `${campaignId}/${Date.now()}-${file.name.replace(/\.[^/.]+$/, '.webp')}`;
  const { data, error } = await supabase.storage
    .from('location-images')
    .upload(fileName, compressedFile);

  if (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }

  // 3. Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('location-images').getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Delete location image from Supabase Storage
 * @param imageUrl - Full public URL of the image
 */
export async function deleteLocationImage(imageUrl: string): Promise<void> {
  const supabase = getSupabaseClient();

  // Extract file path from URL
  const fileName = imageUrl.split('/location-images/')[1];

  if (!fileName) {
    console.error('Invalid image URL:', imageUrl);
    throw new Error('Invalid image URL');
  }

  const { error } = await supabase.storage
    .from('location-images')
    .remove([fileName]);

  if (error) {
    console.error('Failed to delete image:', error);
    throw error;
  }
}

/**
 * Upload NPC image to Supabase Storage with WebP compression
 * @param campaignId - Campaign ID for folder structure
 * @param file - Image file to upload
 * @returns Public URL of uploaded image
 */
export async function uploadNPCImage(
  campaignId: string,
  file: File
): Promise<string> {
  const supabase = getSupabaseClient();

  // 1. Client-side compression to WebP (max 5 MB)
  const compressedFile = await compressImageToWebP(file, 5);

  // 2. Upload to Supabase Storage
  const fileName = `${campaignId}/${Date.now()}-${file.name.replace(/\.[^/.]+$/, '.webp')}`;
  const { data, error } = await supabase.storage
    .from('npc-images')
    .upload(fileName, compressedFile);

  if (error) {
    console.error('Failed to upload NPC image:', error);
    throw error;
  }

  // 3. Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('npc-images').getPublicUrl(data?.path || fileName);

  return publicUrl;
}

/**
 * Delete NPC image from Supabase Storage
 * @param imageUrl - Full public URL of the image
 */
export async function deleteNPCImage(imageUrl: string): Promise<void> {
  const supabase = getSupabaseClient();

  // Extract file path from URL
  const fileName = imageUrl.split('/npc-images/')[1];

  if (!fileName) {
    console.error('Invalid NPC image URL:', imageUrl);
    throw new Error('Invalid image URL');
  }

  const { error } = await supabase.storage
    .from('npc-images')
    .remove([fileName]);

  if (error) {
    console.error('Failed to delete NPC image:', error);
    throw error;
  }
}

/**
 * Upload Player Character image to Supabase Storage with WebP compression
 * @param campaignId - Campaign ID for folder structure
 * @param file - Image file to upload
 * @returns Public URL of uploaded image
 */
export async function uploadPlayerCharacterImage(
  campaignId: string,
  file: File
): Promise<string> {
  const supabase = getSupabaseClient();

  // 1. Client-side compression to WebP (max 5 MB)
  const compressedFile = await compressImageToWebP(file, 5);

  // 2. Upload to Supabase Storage
  const fileName = `${campaignId}/${Date.now()}-${file.name.replace(/\.[^/.]+$/, '.webp')}`;
  const { data, error } = await supabase.storage
    .from('pc-images')
    .upload(fileName, compressedFile);

  if (error) {
    console.error('Failed to upload player character image:', error);
    throw error;
  }

  // 3. Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('pc-images').getPublicUrl(data?.path || fileName);

  return publicUrl;
}

/**
 * Delete Player Character image from Supabase Storage
 * @param imageUrl - Full public URL of the image
 */
export async function deletePlayerCharacterImage(imageUrl: string): Promise<void> {
  const supabase = getSupabaseClient();

  // Extract file path from URL
  const fileName = imageUrl.split('/pc-images/')[1];

  if (!fileName) {
    console.error('Invalid player character image URL:', imageUrl);
    throw new Error('Invalid image URL');
  }

  const { error } = await supabase.storage
    .from('pc-images')
    .remove([fileName]);

  if (error) {
    console.error('Failed to delete player character image:', error);
    throw error;
  }
}
