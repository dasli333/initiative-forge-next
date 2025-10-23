import { test as base, type Page } from "@playwright/test";
import { loginAsTestUser } from "../utils/auth.helpers";
import { cleanupTestDataFromEnv } from "../utils/teardown.helpers";

/**
 * Extended test fixture with authenticated user
 */
export const test = base.extend<{ authenticatedPage: Page }>({
  /**
   * Fixture that provides an authenticated page with test user already logged in
   * This can be reused across tests to avoid repeated login steps
   */
  authenticatedPage: async ({ page }, use) => {
    // Login with test user credentials
    await loginAsTestUser(page);

    // Provide the authenticated page to the test
    await use(page);

    // Cleanup is handled by the test itself or global teardown
  },
});

// Add afterEach hook to clean up test data if test fails
test.afterEach(async ({}, testInfo) => {
  // Only run cleanup if test failed to ensure we don't leave orphaned data
  if (testInfo.status !== "passed") {
    console.log(`\n[Cleanup] Test "${testInfo.title}" failed, running cleanup...`);
    try {
      await cleanupTestDataFromEnv();
      console.log("[Cleanup] Failed test cleanup completed");
    } catch (error) {
      console.error("[Cleanup] Failed test cleanup error:", error);
      // Don't throw - cleanup failures shouldn't fail the test
    }
  }
});

export { expect } from "@playwright/test";
