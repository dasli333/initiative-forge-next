import { type Page, type APIRequestContext } from "@playwright/test";

/**
 * Generates a unique test name with timestamp
 */
export function generateUniqueName(prefix: string): string {
  const timestamp = Date.now();
  return `${prefix}_${timestamp}`;
}

/**
 * Wait for API response with specific status
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  status: number = 200
) {
  return await page.waitForResponse(
    (response) => {
      const url = response.url();
      const matches =
        typeof urlPattern === "string" ? url.includes(urlPattern) : urlPattern.test(url);
      return matches && response.status() === status;
    },
    { timeout: 10000 }
  );
}

/**
 * @deprecated These API helper functions are obsolete - they use /api routes from the old architecture.
 * The current app uses direct Supabase calls without Next.js API routes.
 * For cleanup, use teardown.helpers.ts which uses Supabase directly.
 * Kept for backward compatibility only.
 */

/**
 * Delete all campaigns for a user (cleanup)
 * @deprecated Use teardown.helpers.ts instead
 */
export async function deleteAllCampaigns(request: APIRequestContext, baseURL: string) {
  const response = await request.get(`${baseURL}/api/campaigns`);
  if (response.ok()) {
    const campaigns = await response.json();
    for (const campaign of campaigns) {
      await request.delete(`${baseURL}/api/campaigns/${campaign.id}`);
    }
  }
}

/**
 * Delete a specific campaign by ID
 * @deprecated Use teardown.helpers.ts instead
 */
export async function deleteCampaign(
  request: APIRequestContext,
  baseURL: string,
  campaignId: string
) {
  await request.delete(`${baseURL}/api/campaigns/${campaignId}`);
}

/**
 * Delete a specific character by ID
 * @deprecated Use teardown.helpers.ts instead
 */
export async function deleteCharacter(
  request: APIRequestContext,
  baseURL: string,
  characterId: string
) {
  await request.delete(`${baseURL}/api/characters/${characterId}`);
}

/**
 * Delete all combats for a campaign
 * @deprecated Use teardown.helpers.ts instead
 */
export async function deleteAllCombatsForCampaign(
  request: APIRequestContext,
  baseURL: string,
  campaignId: string
) {
  const response = await request.get(`${baseURL}/api/campaigns/${campaignId}/combats`);
  if (response.ok()) {
    const combats = await response.json();
    for (const combat of combats) {
      await request.delete(`${baseURL}/api/combats/${combat.id}`);
    }
  }
}

/**
 * Delete a specific combat by ID
 * @deprecated Use teardown.helpers.ts instead
 */
export async function deleteCombat(
  request: APIRequestContext,
  baseURL: string,
  combatId: string
) {
  await request.delete(`${baseURL}/api/combats/${combatId}`);
}

/**
 * Create a test campaign
 * @deprecated Use UI interactions or Supabase directly instead
 */
export async function createTestCampaign(
  request: APIRequestContext,
  baseURL: string,
  name?: string
) {
  const campaignName = name || generateUniqueName("Test Campaign");
  const response = await request.post(`${baseURL}/api/campaigns`, {
    data: { name: campaignName },
  });
  return await response.json();
}

/**
 * Create a test character
 * @deprecated Use UI interactions or Supabase directly instead
 */
export async function createTestCharacter(
  request: APIRequestContext,
  baseURL: string,
  campaignId: string,
  overrides?: Partial<{
    name: string;
    max_hp: number;
    armor_class: number;
    speed: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }>
) {
  const characterData = {
    name: generateUniqueName("Test Character"),
    max_hp: 25,
    armor_class: 15,
    speed: 30,
    strength: 14,
    dexterity: 16,
    constitution: 13,
    intelligence: 10,
    wisdom: 12,
    charisma: 8,
    actions: [],
    ...overrides,
  };

  const response = await request.post(`${baseURL}/api/campaigns/${campaignId}/characters`, {
    data: characterData,
  });
  return await response.json();
}

/**
 * Wait for element to be stable (useful for animations)
 */
export async function waitForStable(page: Page, selector: string, timeout: number = 3000) {
  await page.waitForSelector(selector, { state: "visible", timeout });
  await page.waitForTimeout(300); // Wait for animations
}

