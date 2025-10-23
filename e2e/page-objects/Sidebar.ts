import { type Page, type Locator } from "@playwright/test";

/**
 * Page Object Model for Sidebar Navigation
 */
export class Sidebar {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly currentCampaignDisplay: Locator;
  readonly currentCampaignName: Locator;
  readonly selectCampaignLink: Locator;
  readonly campaignNav: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.getByTestId("sidebar");
    this.currentCampaignDisplay = page.getByTestId("current-campaign-display");
    this.currentCampaignName = page.getByTestId("current-campaign-name");
    this.selectCampaignLink = page.getByTestId("select-campaign-link");
    this.campaignNav = page.getByTestId("campaign-nav");
  }

  /**
   * Check if sidebar is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.sidebar.isVisible();
  }

  /**
   * Get the current campaign name from sidebar
   */
  async getCurrentCampaignName(): Promise<string | null> {
    if (await this.currentCampaignName.isVisible().catch(() => false)) {
      return await this.currentCampaignName.textContent();
    }
    return null;
  }

  /**
   * Check if campaign navigation is visible
   */
  async isCampaignNavVisible(): Promise<boolean> {
    return await this.campaignNav.isVisible().catch(() => false);
  }

  /**
   * Navigate to "Campaign Home"
   */
  async goToCampaignHome() {
    const link = this.page.getByTestId("nav-campaign-home");
    await link.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Navigate to "Player Characters"
   */
  async goToPlayerCharacters() {
    const link = this.page.getByTestId("nav-player-characters");
    await link.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Navigate to "Combat"
   */
  async goToCombat() {
    const link = this.page.getByTestId("nav-combat");
    await link.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Navigate to "My Campaigns" (global nav)
   */
  async goToCampaigns() {
    const link = this.page.getByTestId("nav-my-campaigns");
    await link.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Navigate to "Spells Library" (global nav)
   */
  async goToSpells() {
    const link = this.page.getByTestId("nav-spells-library");
    await link.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Navigate to "Monsters Library" (global nav)
   */
  async goToMonsters() {
    const link = this.page.getByTestId("nav-monsters-library");
    await link.click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Wait for campaign navigation to appear
   * Useful after selecting a campaign
   */
  async waitForCampaignNav() {
    await this.campaignNav.waitFor({ state: "visible", timeout: 5000 });
  }

  /**
   * Wait for current campaign name to update
   */
  async waitForCampaignName(expectedName: string, timeout = 5000) {
    await this.page.waitForFunction(
      (name) => {
        const element = document.querySelector('[data-testid="current-campaign-name"]');
        return element?.textContent?.trim() === name;
      },
      expectedName,
      { timeout }
    );
  }

  /**
   * Check if a navigation item is active (highlighted)
   */
  async isNavItemActive(navItemTestId: string): Promise<boolean> {
    const navItem = this.page.getByTestId(navItemTestId);
    const ariaCurrent = await navItem.getAttribute("aria-current");
    return ariaCurrent === "page";
  }
}
