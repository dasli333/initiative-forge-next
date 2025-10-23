import { cleanupTestDataFromEnv } from "./utils/teardown.helpers";

/**
 * Global setup for Playwright E2E tests
 * Runs once before all tests to ensure clean database state
 */
async function globalSetup() {
  console.log("\n=================================================");
  console.log("GLOBAL SETUP: Cleaning up E2E test data before tests");
  console.log("=================================================\n");

  try {
    await cleanupTestDataFromEnv();
    console.log("\n✓ Global setup completed successfully\n");
  } catch (error) {
    console.error("\n✗ Global setup failed:", error);
    console.error("Tests will continue but may encounter data conflicts\n");
    // Don't throw - we want tests to run even if cleanup fails
  }
}

export default globalSetup;
