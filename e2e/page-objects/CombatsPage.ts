import { type Page, type Locator } from "@playwright/test";

/**
 * Page Object Model for Combats List Page
 */
export class CombatsPage {
  readonly page: Page;
  readonly createCombatButton: Locator;
  readonly createCombatButtonEmpty: Locator;
  readonly combatsHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createCombatButton = page.getByTestId("create-combat-button");
    this.createCombatButtonEmpty = page.getByTestId("create-combat-button-empty");
    this.combatsHeading = page.getByRole("heading", { name: /combats/i });
  }

  async goto(campaignId: string) {
    await this.page.goto(`/campaigns/${campaignId}/combats`);
    await this.combatsHeading.waitFor({ state: "visible" });
  }

  /**
   * Click the "Start New Combat" button in the header to navigate to the combat wizard
   * This button is always visible in the header
   */
  async clickCreateCombat() {
    await this.createCombatButton.click();
    // Wait for navigation to combat wizard
    await this.page.waitForURL(/\/combats\/new$/);
  }

  /**
   * Click the "Start New Combat" button in the empty state
   * This button is only visible when there are no combats
   */
  async clickCreateCombatFromEmptyState() {
    await this.createCombatButtonEmpty.click();
    // Wait for navigation to combat wizard
    await this.page.waitForURL(/\/combats\/new$/);
  }

  /**
   * Check if the empty state is visible (no combats exist yet)
   */
  async isEmptyStateVisible(): Promise<boolean> {
    const emptyStateHeading = this.page.getByRole("heading", { name: /no combats yet/i });
    return await emptyStateHeading.isVisible();
  }
}
