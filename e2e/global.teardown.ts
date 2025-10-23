import { cleanupTestDataFromEnv } from "./utils/teardown.helpers";

/**
 * Global teardown for Playwright E2E tests
 * Runs once after all tests complete to clean up test data from the database
 */
async function globalTeardown() {
  console.log("\n=================================================");
  console.log("GLOBAL TEARDOWN: Cleaning up E2E test data");
  console.log("=================================================\n");

  try {
    await cleanupTestDataFromEnv();
    console.log("\n✓ Global teardown completed successfully\n");
  } catch (error) {
    console.error("\n✗ Global teardown failed:", error);
    console.error("Some test data may remain in the database\n");
    // Don't throw - we don't want teardown failures to fail the test suite
  }
}

export default globalTeardown;
