import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for Combat Tracker
 */
export class CombatTrackerPage {
  readonly page: Page;

  // Control Bar
  readonly rollInitiativeButton: Locator;
  readonly startCombatButton: Locator;
  readonly nextTurnButton: Locator;
  readonly saveCombatButton: Locator;
  readonly backButton: Locator;

  // Round Counter
  readonly roundCounter: Locator;

  // Roll Controls (Right Panel)
  readonly normalRollMode: Locator;
  readonly advantageRollMode: Locator;
  readonly disadvantageRollMode: Locator;

  constructor(page: Page) {
    this.page = page;

    // Control Bar
    this.rollInitiativeButton = page.getByTestId("roll-initiative-button");
    this.startCombatButton = page.getByTestId("start-combat-button");
    this.nextTurnButton = page.getByTestId("next-turn-button");
    this.saveCombatButton = page.getByTestId("save-combat-button");
    this.backButton = page.getByTestId("back-button");

    // Round Counter
    this.roundCounter = page.getByTestId("round-counter");

    // Roll Controls
    this.normalRollMode = page.getByTestId("roll-mode-normal");
    this.advantageRollMode = page.getByTestId("roll-mode-advantage");
    this.disadvantageRollMode = page.getByTestId("roll-mode-disadvantage");
  }

  async goto(combatId: string) {
    await this.page.goto(`/combats/${combatId}`);
    await this.rollInitiativeButton.waitFor({ state: "visible" });
  }

  /**
   * Initiative List Methods
   */
  getInitiativeItem(participantName: string): Locator {
    return this.page.getByTestId(`initiative-item-${participantName}`);
  }

  async getInitiativeValue(participantName: string): Promise<number> {
    const item = this.getInitiativeItem(participantName);
    const badge = item.getByTestId("initiative-badge");
    const text = await badge.textContent();
    return parseInt(text || "0");
  }

  async isParticipantActive(participantName: string): Promise<boolean> {
    const item = this.getInitiativeItem(participantName);
    const isActive = await item.getAttribute("data-active");
    return isActive === "true";
  }

  /**
   * Get the currently active participant name
   */
  async getActiveParticipantName(): Promise<string | null> {
    const activeItem = this.page.locator('[data-testid^="initiative-item-"][data-active="true"]');
    const isVisible = await activeItem.isVisible().catch(() => false);
    if (!isVisible) return null;

    const testId = await activeItem.getAttribute("data-testid");
    return testId?.replace("initiative-item-", "") || null;
  }

  /**
   * HP Controls Methods
   */
  async getHPValue(participantName: string): Promise<{ current: number; max: number }> {
    const item = this.getInitiativeItem(participantName);
    const hpDisplay = item.getByTestId("hp-display");
    const text = await hpDisplay.textContent();
    const match = text?.match(/(\d+)\s*\/\s*(\d+)/);

    if (match) {
      return { current: parseInt(match[1]), max: parseInt(match[2]) };
    }
    return { current: 0, max: 0 };
  }

  async applyDamage(participantName: string, amount: number) {
    const item = this.getInitiativeItem(participantName);
    const damageInput = item.getByTestId("hp-amount-input");
    const damageButton = item.getByTestId("hp-damage-button");
    const hpDisplay = item.getByTestId("hp-display");

    // Get current HP before damage
    const currentText = await hpDisplay.textContent();

    await damageInput.fill(amount.toString());
    await damageButton.click();

    // Wait for HP display to update to a different value
    await this.page.waitForFunction(
      ({ element, previousText }) => element?.textContent !== previousText,
      { element: await hpDisplay.elementHandle(), previousText: currentText },
      { timeout: 5000 }
    );
  }

  async applyHealing(participantName: string, amount: number) {
    const item = this.getInitiativeItem(participantName);
    const healInput = item.getByTestId("hp-amount-input");
    const healButton = item.getByTestId("hp-heal-button");
    const hpDisplay = item.getByTestId("hp-display");

    // Get current HP before healing
    const currentText = await hpDisplay.textContent();

    await healInput.fill(amount.toString());
    await healButton.click();

    // Wait for HP display to update to a different value
    await this.page.waitForFunction(
      ({ element, previousText }) => element?.textContent !== previousText,
      { element: await hpDisplay.elementHandle(), previousText: currentText },
      { timeout: 5000 }
    );
  }

  async getHPProgressBarColor(participantName: string): Promise<string> {
    const item = this.getInitiativeItem(participantName);
    const progressBar = item.getByTestId("hp-progress-bar");
    const className = await progressBar.getAttribute("class");

    if (className?.includes("bg-green")) return "green";
    if (className?.includes("bg-yellow")) return "yellow";
    if (className?.includes("bg-red")) return "red";
    return "unknown";
  }

  /**
   * Condition Methods
   */
  async addCondition(participantName: string, conditionName: string, durationRounds?: number) {
    const item = this.getInitiativeItem(participantName);
    const addConditionButton = item.getByTestId("add-condition-button");
    await addConditionButton.click();

    // Wait for dialog
    const conditionDialog = this.page.getByTestId("condition-select");
    await conditionDialog.waitFor({ state: "visible" });

    // Click the Radix UI Select trigger to open the dropdown
    await conditionDialog.click();

    // Wait for the dropdown content to appear and click the desired option
    await this.page.getByRole("option", { name: conditionName }).click();

    if (durationRounds !== undefined) {
      const durationInput = this.page.getByTestId("condition-duration-input");
      await durationInput.fill(durationRounds.toString());
    }

    const confirmButton = this.page.getByTestId("confirm-add-condition");
    await confirmButton.click();

    // Wait for dialog to close by waiting for it to be hidden
    await conditionDialog.waitFor({ state: "hidden", timeout: 5000 });
  }

  async hasCondition(participantName: string, conditionName: string): Promise<boolean> {
    const item = this.getInitiativeItem(participantName);
    const conditionBadge = item.getByTestId(`condition-badge-${conditionName}`);
    return await conditionBadge.isVisible().catch(() => false);
  }

  async removeCondition(participantName: string, conditionName: string) {
    const item = this.getInitiativeItem(participantName);
    const conditionBadge = item.getByTestId(`condition-badge-${conditionName}`);

    // Hover to reveal remove button
    await conditionBadge.hover();

    const removeButton = conditionBadge.getByTestId("remove-condition-button");
    await removeButton.click();

    // Wait for condition badge to disappear
    await conditionBadge.waitFor({ state: "hidden", timeout: 5000 });
  }

  /**
   * Combat Flow Methods
   */
  async rollInitiative() {
    await this.rollInitiativeButton.click();

    // Wait for initiative rolls to complete by checking that all participants have initiative values
    // The start combat button should also become visible after rolling initiative
    await this.startCombatButton.waitFor({ state: "visible", timeout: 10000 });
  }

  async startCombat() {
    await this.startCombatButton.click();

    // Wait for first participant to become active (indicated by data-active="true")
    await this.page.locator('[data-testid^="initiative-item-"][data-active="true"]').waitFor({
      state: "visible",
      timeout: 5000
    });
  }

  async goToNextTurn() {
    // Get the current active participant before clicking
    const currentActive = await this.getActiveParticipantName();

    await this.nextTurnButton.click();

    // Wait for the active participant to change OR for the round counter to update
    // (if we're going from last participant back to first, the active participant name might be the same
    // but the round number should have increased)
    await this.page.waitForFunction(
      async ({ previousActive, page }) => {
        const currentActiveName = await page.evaluate(() => {
          const activeItem = document.querySelector('[data-testid^="initiative-item-"][data-active="true"]');
          return activeItem?.getAttribute('data-testid')?.replace('initiative-item-', '') || null;
        });
        return currentActiveName !== previousActive;
      },
      { previousActive: currentActive, page: this.page },
      { timeout: 5000 }
    ).catch(async () => {
      // If active participant didn't change, the round might have changed instead
      // This is acceptable and we can continue
    });
  }

  async saveCombat() {
    // Wait for the save request to complete
    await Promise.all([
      this.page.waitForResponse(
        response =>
          response.url().includes('supabase') &&
          (response.request().method() === 'POST' || response.request().method() === 'PATCH'),
        { timeout: 10000 }
      ),
      this.saveCombatButton.click()
    ]);
  }

  async getCurrentRound(): Promise<number> {
    const text = await this.roundCounter.textContent();
    const match = text?.match(/Round\s+(\d+)/i);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Character Sheet (Active Participant) Methods
   */
  async hasAction(actionName: string): Promise<boolean> {
    const actionButton = this.page.getByTestId(`action-button-${actionName}`);
    return await actionButton.isVisible().catch(() => false);
  }

  async executeAction(actionName: string) {
    const actionButton = this.page.getByTestId(`action-button-${actionName}`);

    // Click the action button - this should trigger a roll
    await actionButton.click();

    // Wait for at least one roll card to be visible in the roll log
    // Using Playwright locator with auto-retry
    const rollLog = this.page.getByTestId("roll-log");
    const firstRollCard = rollLog.locator('[data-testid^="roll-card-"]').first();

    // This will automatically retry until the element appears or timeout
    await firstRollCard.waitFor({ state: "visible", timeout: 10000 });
  }

  async goToParticipantWithAction(actionName: string, maxAttempts: number = 10): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const hasAction = await this.hasAction(actionName);
      if (hasAction) return;
      await this.goToNextTurn();
    }
    throw new Error(`Could not find participant with action: ${actionName} after ${maxAttempts} attempts`);
  }

  async getLastRollResult(): Promise<{ type: string; total: number; details: string }> {
    const rollLog = this.page.getByTestId("roll-log");
    const lastRoll = rollLog.locator('[data-testid^="roll-card-"]').first();

    const type = await lastRoll.getByTestId("roll-type").textContent();
    const total = await lastRoll.getByTestId("roll-total").textContent();
    const details = await lastRoll.getByTestId("roll-details").textContent();

    return {
      type: type || "",
      total: parseInt(total || "0"),
      details: details || "",
    };
  }

  /**
   * Roll Mode Methods
   */
  async setRollMode(mode: "normal" | "advantage" | "disadvantage") {
    let targetButton: Locator;

    switch (mode) {
      case "normal":
        targetButton = this.normalRollMode;
        break;
      case "advantage":
        targetButton = this.advantageRollMode;
        break;
      case "disadvantage":
        targetButton = this.disadvantageRollMode;
        break;
    }

    // Click the target button and wait for it to become active
    await targetButton.click();

    // Use Playwright expect with auto-retry to wait for data-active attribute
    await expect(targetButton).toHaveAttribute("data-active", "true", { timeout: 2000 });
  }

  async getCurrentRollMode(): Promise<"normal" | "advantage" | "disadvantage"> {
    if (await this.advantageRollMode.getAttribute("data-active") === "true") {
      return "advantage";
    }
    if (await this.disadvantageRollMode.getAttribute("data-active") === "true") {
      return "disadvantage";
    }
    return "normal";
  }

  /**
   * Get all participants in initiative order
   */
  async getParticipantsInOrder(): Promise<string[]> {
    const items = this.page.locator('[data-testid^="initiative-item-"]');
    const count = await items.count();
    const names: string[] = [];

    for (let i = 0; i < count; i++) {
      const testId = await items.nth(i).getAttribute("data-testid");
      const name = testId?.replace("initiative-item-", "");
      if (name) names.push(name);
    }

    return names;
  }
}
