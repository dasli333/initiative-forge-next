import { type Page, type Locator } from "@playwright/test";

/**
 * Page Object Model for Combat Creation Wizard (5 steps)
 */
export class CombatWizardPage {
  readonly page: Page;

  // Step 1 - Combat Name
  readonly combatNameInput: Locator;

  // Step 2 - Select Player Characters
  readonly characterCheckbox: (name: string) => Locator;

  // Step 3 - Add Monsters
  readonly monsterSearchInput: Locator;
  readonly monsterCard: (name: string) => Locator;
  readonly addMonsterButton: (name: string) => Locator;
  readonly monsterCountInput: (name: string) => Locator;

  // Step 4 - Add NPCs (skipped in tests for now)

  // Navigation
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly createCombatButton: Locator;
  readonly cancelButton: Locator;

  // Progress
  readonly stepIndicator: (step: number) => Locator;

  constructor(page: Page) {
    this.page = page;

    // Step 1
    this.combatNameInput = page.getByTestId("combat-name-input");

    // Step 2
    this.characterCheckbox = (name: string) =>
      page.getByTestId(`character-checkbox-${name}`);

    // Step 3
    this.monsterSearchInput = page.getByTestId("monster-search-input");
    this.monsterCard = (name: string) => page.getByTestId(`monster-card-${name}`);
    this.addMonsterButton = (name: string) =>
      page.getByTestId(`add-monster-${name}`);
    this.monsterCountInput = (name: string) =>
      page.getByTestId(`monster-count-${name}`);

    // Navigation
    this.nextButton = page.getByTestId("wizard-next-button");
    this.backButton = page.getByTestId("wizard-back-button");
    this.createCombatButton = page.getByTestId("create-combat-button");
    this.cancelButton = page.getByRole("button", { name: /cancel/i });

    // Progress
    this.stepIndicator = (step: number) => page.getByTestId(`step-indicator-${step}`);
  }

  async goto(campaignId: string) {
    await this.page.goto(`/campaigns/${campaignId}/combats/new`);
    await this.combatNameInput.waitFor({ state: "visible" });
  }

  /**
   * Step 1: Enter combat name
   */
  async enterCombatName(name: string) {
    await this.combatNameInput.fill(name);
  }

  /**
   * Step 2: Select player characters
   */
  async selectPlayerCharacter(characterName: string) {
    const checkbox = this.characterCheckbox(characterName);
    await checkbox.check();
  }

  async selectPlayerCharacters(characterNames: string[]) {
    for (const name of characterNames) {
      await this.selectPlayerCharacter(name);
    }
  }

  /**
   * Step 3: Add monsters
   */
  async searchMonster(searchTerm: string) {
    await this.monsterSearchInput.fill(searchTerm);

    // Wait for either search results or no results message
    await Promise.race([
      this.page.waitForSelector('[data-testid^="monster-card-"]', { state: "visible", timeout: 5000 }),
      this.page.waitForSelector('text=No monsters found', { state: "visible", timeout: 5000 })
    ]);
  }

  async addMonster(monsterName: string, count: number = 1) {
    // Wait for monster card to be visible first
    const monsterCard = this.monsterCard(monsterName);
    await monsterCard.waitFor({ state: "visible", timeout: 5000 });

    // First, add the monster if not already added
    const addButton = this.addMonsterButton(monsterName);
    const isVisible = await addButton.isVisible().catch(() => false);

    if (isVisible) {
      await addButton.click();
      // Wait for the monster to be added - the count badge should appear
      const countBadge = this.monsterCountInput(monsterName);
      await countBadge.waitFor({ state: "visible", timeout: 5000 });
    }

    // Set the count if different from 1
    if (count > 1) {
      // Click the badge to enter edit mode (this will show the input)
      const countBadge = this.monsterCountInput(monsterName);
      await countBadge.click();

      // Wait for the input to be enabled
      await this.page.waitForFunction(
        ({ badge }) => !badge.hasAttribute('disabled') && !badge.hasAttribute('readonly'),
        { badge: await countBadge.elementHandle() },
        { timeout: 5000 }
      );

      // Now fill the input
      await countBadge.fill(count.toString());

      // Press Enter or blur to confirm (Enter is handled by the component)
      await countBadge.press("Enter");
    }
  }

  /**
   * Navigation methods
   */
  async goToNextStep() {
    await this.nextButton.click();

    // Wait for the next button to disappear or create button to appear
    // This indicates the step transition is complete
    await this.page.waitForLoadState("domcontentloaded");
  }

  async goToPreviousStep() {
    await this.backButton.click();

    // Wait for the step transition to complete
    await this.page.waitForLoadState("domcontentloaded");
  }

  async finishWizard() {
    await this.createCombatButton.click();
    // Wait for redirect to combat view
    await this.page.waitForURL(/\/combats\/[^/]+$/);
  }

  /**
   * Complete workflow: Create combat with name, characters, and monsters
   */
  async createCombat(data: {
    name: string;
    characters?: string[];
    monsters?: Array<{ name: string; count: number }>;
  }) {
    // Step 1: Combat name
    await this.enterCombatName(data.name);
    await this.goToNextStep();

    // Step 2: Select characters
    if (data.characters && data.characters.length > 0) {
      await this.selectPlayerCharacters(data.characters);
    }
    await this.goToNextStep();

    // Step 3: Add monsters
    if (data.monsters && data.monsters.length > 0) {
      for (const monster of data.monsters) {
        await this.searchMonster(monster.name);
        await this.addMonster(monster.name, monster.count);
        // Clear search for next monster
        await this.monsterSearchInput.clear();
      }
    }
    await this.goToNextStep();

    // Step 4: Skip NPCs
    await this.goToNextStep();

    // Step 5: Summary and create
    await this.finishWizard();
  }

  /**
   * Verify current step
   */
  async getCurrentStep(): Promise<number> {
    for (let i = 1; i <= 5; i++) {
      const indicator = this.stepIndicator(i);
      const isActive = await indicator.getAttribute("data-active");
      if (isActive === "true") {
        return i;
      }
    }
    return 0;
  }

  /**
   * Get summary participant count
   */
  async getSummaryParticipantCount(): Promise<number> {
    const summary = this.page.getByTestId("combat-summary-participants");
    const text = await summary.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }
}
