import { type Page } from "@playwright/test";

/**
 * Get test user credentials from environment
 */
export function getTestUser() {
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;
  const userId = process.env.E2E_USERNAME_ID;

  if (!username || !password || !userId) {
    throw new Error(
      "Test user credentials not found in environment. Please check .env.test file."
    );
  }

  return { username, password, userId };
}

/**
 * Perform login with test user credentials
 */
export async function loginAsTestUser(page: Page) {
  const { username, password } = getTestUser();

  await page.goto("/login");
  await page.getByLabel(/email/i).fill(username);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();

  // Wait for redirect to campaigns page
  await page.waitForURL(/\/campaigns/, { timeout: 10000 });
}

/**
 * Perform logout
 */
export async function logout(page: Page) {
  // Navigate to a page with logout button (campaigns page)
  await page.goto("/campaigns");

  // Click user menu or logout button
  const logoutButton = page.getByRole("button", { name: /log out|logout|sign out/i });
  await logoutButton.click();

  // Wait for redirect to login page
  await page.waitForURL(/\/login/, { timeout: 10000 });
}

/**
 * Check if user is authenticated by checking for redirect
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  await page.goto("/campaigns");
  await page.waitForURL(/\/(campaigns|login)/);

  const currentUrl = page.url();
  return !currentUrl.includes("/login");
}
