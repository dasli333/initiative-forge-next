import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Singleton client for browser
let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseClient() {
  // Only create client if we're in the browser and have valid env vars
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be used in the browser');
  }

  if (client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseKey);

  return client;
}

// Helper - note: this will only work when called from browser context
export function getSupabase() {
  return getSupabaseClient();
}
