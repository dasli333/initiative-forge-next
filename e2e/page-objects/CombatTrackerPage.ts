import { type Page, type Locator } from "@playwright/test";

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

    await damageInput.fill(amount.toString());
    await damageButton.click();
    await this.page.waitForTimeout(200);
  }

  async applyHealing(participantName: string, amount: number) {
    const item = this.getInitiativeItem(participantName);
    const healInput = item.getByTestId("hp-amount-input");
    const healButton = item.getByTestId("hp-heal-button");

    await healInput.fill(amount.toString());
    await healButton.click();
    await this.page.waitForTimeout(200);
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
    await this.page.waitForSelector('[data-testid="condition-select"]', { state: "visible" });

    // Click the Radix UI Select trigger to open the dropdown
    const conditionSelect = this.page.getByTestId("condition-select");
    await conditionSelect.click();

    // Wait for the dropdown content to appear and click the desired option
    await this.page.getByRole("option", { name: conditionName }).click();

    if (durationRounds !== undefined) {
      const durationInput = this.page.getByTestId("condition-duration-input");
      await durationInput.fill(durationRounds.toString());
    }

    const confirmButton = this.page.getByTestId("confirm-add-condition");
    await confirmButton.click();

    // Wait for dialog to close
    await this.page.waitForTimeout(300);
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
    await this.page.waitForTimeout(200);
  }

  /**
   * Combat Flow Methods
   */
  async rollInitiative() {
    await this.rollInitiativeButton.click();
    await this.page.waitForTimeout(500); // Wait for rolls to complete
  }

  async startCombat() {
    await this.startCombatButton.click();
    await this.page.waitForTimeout(300);
  }

  async goToNextTurn() {
    await this.nextTurnButton.click();
    await this.page.waitForTimeout(300);
  }

  async saveCombat() {
    await this.saveCombatButton.click();
    await this.page.waitForTimeout(500);
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
    await actionButton.click();
    await this.page.waitForTimeout(300);
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
    switch (mode) {
      case "normal":
        await this.normalRollMode.click();
        break;
      case "advantage":
        await this.advantageRollMode.click();
        break;
      case "disadvantage":
        await this.disadvantageRollMode.click();
        break;
    }
    await this.page.waitForTimeout(200);
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
