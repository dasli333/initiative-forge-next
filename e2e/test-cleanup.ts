/**
 * Manual test cleanup script
 * Run with: npx tsx e2e/test-cleanup.ts
 */
import { config } from "dotenv";
import { resolve } from "node:path";

// Load .env.test
config({ path: resolve(process.cwd(), ".env.test") });

import { cleanupTestDataFromEnv } from "./utils/teardown.helpers";

async function main() {
  console.log("\n🧹 Manual Test Cleanup");
  console.log("=====================\n");

  try {
    await cleanupTestDataFromEnv();
    console.log("\n✅ Cleanup completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Cleanup failed:", error);
    process.exit(1);
  }
}

main();
