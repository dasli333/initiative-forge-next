import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/db/database.types";

/**
 * Creates a Supabase client for E2E test cleanup
 * Uses service role or anon key with user authentication
 */
function createTestSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not found in environment");
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}

/**
 * Cleans up all test data for a specific user
 * Deletes all campaigns (which cascades to characters and combats)
 */
export async function cleanupTestData(userId: string, email: string, password: string) {
  const supabase = createTestSupabaseClient();

  try {
    console.log(`[Teardown] Cleaning up test data for user: ${userId}`);

    // Sign in as the test user to bypass RLS policies
    console.log(`[Teardown] Signing in as test user: ${email}`);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("[Teardown] Error signing in:", signInError);
      throw signInError;
    }

    console.log("[Teardown] Successfully signed in");

    // Delete all campaigns for the test user
    // This will cascade delete:
    // - player_characters (via campaign_id foreign key)
    // - combats (via campaign_id foreign key)
    const { data: campaigns, error: fetchError } = await supabase
      .from("campaigns")
      .select("id, name")
      .eq("user_id", userId);

    if (fetchError) {
      console.error("[Teardown] Error fetching campaigns:", fetchError);
      throw fetchError;
    }

    if (!campaigns || campaigns.length === 0) {
      console.log("[Teardown] No campaigns found to clean up");
      await supabase.auth.signOut();
      return;
    }

    console.log(`[Teardown] Found ${campaigns.length} campaigns to delete:`);
    campaigns.forEach((campaign) => {
      console.log(`  - ${campaign.name} (${campaign.id})`);
    });

    // Delete all campaigns (cascade will handle related data)
    const { error: deleteError } = await supabase
      .from("campaigns")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      console.error("[Teardown] Error deleting campaigns:", deleteError);
      throw deleteError;
    }

    console.log(`[Teardown] Successfully deleted ${campaigns.length} campaigns and related data`);

    // Sign out after cleanup
    await supabase.auth.signOut();
    console.log("[Teardown] Signed out");
  } catch (error) {
    console.error("[Teardown] Failed to clean up test data:", error);
    throw error;
  }
}

/**
 * Cleans up test data using credentials from environment
 * This is the main function to be called from global teardown
 */
export async function cleanupTestDataFromEnv() {
  const userId = process.env.E2E_USERNAME_ID;
  const email = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!userId || !email || !password) {
    throw new Error("E2E test user credentials not found in environment (E2E_USERNAME_ID, E2E_USERNAME, E2E_PASSWORD)");
  }

  await cleanupTestData(userId, email, password);
}

/**
 * Deletes a specific campaign by name for the test user
 * Useful for cleanup in afterEach hooks
 */
export async function deleteCampaignByName(
  userId: string,
  email: string,
  password: string,
  campaignName: string
) {
  const supabase = createTestSupabaseClient();

  try {
    console.log(`[Cleanup] Deleting campaign: ${campaignName}`);

    // Sign in to bypass RLS
    await supabase.auth.signInWithPassword({ email, password });

    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("user_id", userId)
      .eq("name", campaignName);

    await supabase.auth.signOut();

    if (error) {
      console.error(`[Cleanup] Error deleting campaign "${campaignName}":`, error);
      // Don't throw - we want cleanup to be non-blocking
      return false;
    }

    console.log(`[Cleanup] Successfully deleted campaign: ${campaignName}`);
    return true;
  } catch (error) {
    console.error(`[Cleanup] Failed to delete campaign "${campaignName}":`, error);
    return false;
  }
}
