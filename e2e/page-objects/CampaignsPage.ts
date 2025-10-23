import { type Page, type Locator } from "@playwright/test";

/**
 * Page Object Model for Campaigns Page
 */
export class CampaignsPage {
  readonly page: Page;
  readonly createCampaignButton: Locator;
  readonly campaignNameInput: Locator;
  readonly confirmCreateButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createCampaignButton = page.getByTestId("create-campaign-button");
    this.campaignNameInput = page.getByTestId("campaign-name-input");
    this.confirmCreateButton = page.getByTestId("confirm-create-campaign");
    this.cancelButton = page.getByRole("button", { name: /cancel/i });
  }

  async goto() {
    await this.page.goto("/campaigns");
    await this.createCampaignButton.waitFor({ state: "visible" });
  }

  /**
   * Click the create campaign button to open the modal
   */
  async openCreateCampaignModal() {
    await this.createCampaignButton.click();
    await this.page.waitForSelector('[data-testid="campaign-name-input"]', {
      state: "visible",
    });
  }

  /**
   * Create a new campaign with the given name
   */
  async createCampaign(name: string) {
    await this.openCreateCampaignModal();
    await this.campaignNameInput.fill(name);
    await this.confirmCreateButton.click();

    // Wait for the modal to close and campaign to appear
    await this.page.waitForTimeout(500);
  }

  /**
   * Get a campaign card by name
   */
  getCampaignCard(name: string): Locator {
    return this.page.getByTestId(`campaign-card-${name}`);
  }

  /**
   * Click on "Select Campaign" button to navigate to campaign details
   */
  async openCampaign(name: string) {
    const card = this.getCampaignCard(name);
    const selectButton = card.getByTestId("select-campaign-button");
    await selectButton.click();
    await this.page.waitForURL(/\/campaigns\/[^/]+$/);
  }

  /**
   * Edit a campaign name
   */
  async editCampaignName(oldName: string, newName: string) {
    const card = this.getCampaignCard(oldName);

    // Open dropdown menu first
    const optionsButton = card.getByTestId("campaign-options-button");
    await optionsButton.click();

    // Dropdown content is rendered in a portal, so use page level locator
    const editButton = this.page.getByTestId("edit-campaign-name");
    await editButton.click();

    // Input and save button are back inside the card after editing starts
    const input = card.getByTestId("campaign-name-edit-input");
    await input.fill(newName);

    const saveButton = card.getByTestId("save-campaign-name");
    await saveButton.click();

    // Wait for save to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Delete a campaign
   */
  async deleteCampaign(name: string) {
    const card = this.getCampaignCard(name);

    // Open dropdown menu first
    const optionsButton = card.getByTestId("campaign-options-button");
    await optionsButton.click();

    // Dropdown content is rendered in a portal, so use page level locator
    const deleteButton = this.page.getByTestId("delete-campaign-button");
    await deleteButton.click();

    // Confirm deletion in the dialog
    const confirmButton = this.page.getByTestId("confirm-delete-campaign");
    await confirmButton.click();

    // Wait for deletion to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if a campaign exists in the list
   */
  async hasCampaign(name: string): Promise<boolean> {
    const card = this.getCampaignCard(name);
    return await card.isVisible().catch(() => false);
  }

  /**
   * Get all campaign cards
   */
  getAllCampaignCards(): Locator {
    return this.page.locator('[data-testid^="campaign-card-"]');
  }

  /**
   * Count the number of campaigns
   */
  async getCampaignCount(): Promise<number> {
    return await this.getAllCampaignCards().count();
  }
}
