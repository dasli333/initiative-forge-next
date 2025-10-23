import { type Page, type Locator } from "@playwright/test";

/**
 * Page Object Model for Characters Page (within a campaign)
 */
export class CharactersPage {
  readonly page: Page;
  readonly createCharacterButton: Locator;
  readonly characterNameInput: Locator;
  readonly maxHpInput: Locator;
  readonly armorClassInput: Locator;
  readonly speedInput: Locator;
  readonly strengthInput: Locator;
  readonly dexterityInput: Locator;
  readonly constitutionInput: Locator;
  readonly intelligenceInput: Locator;
  readonly wisdomInput: Locator;
  readonly charismaInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createCharacterButton = page.getByTestId("create-character-button");
    this.characterNameInput = page.getByTestId("character-name-input");
    this.maxHpInput = page.getByTestId("character-max-hp-input");
    this.armorClassInput = page.getByTestId("character-ac-input");
    this.speedInput = page.getByTestId("character-speed-input");
    this.strengthInput = page.getByTestId("character-str-input");
    this.dexterityInput = page.getByTestId("character-dex-input");
    this.constitutionInput = page.getByTestId("character-con-input");
    this.intelligenceInput = page.getByTestId("character-int-input");
    this.wisdomInput = page.getByTestId("character-wis-input");
    this.charismaInput = page.getByTestId("character-cha-input");
    this.submitButton = page.getByTestId("submit-character-form");
    this.cancelButton = page.getByRole("button", { name: /cancel/i });
  }

  async goto(campaignId: string) {
    await this.page.goto(`/campaigns/${campaignId}/characters`);
    await this.createCharacterButton.waitFor({ state: "visible" });
  }

  /**
   * Open the character creation modal
   */
  async openCreateCharacterModal() {
    await this.createCharacterButton.click();
    await this.page.waitForSelector('[data-testid="character-name-input"]', {
      state: "visible",
    });
  }

  /**
   * Fill the character form with provided data
   */
  async fillCharacterForm(data: {
    name: string;
    maxHp: number;
    armorClass: number;
    speed?: number;
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  }) {
    await this.characterNameInput.fill(data.name);
    await this.maxHpInput.fill(data.maxHp.toString());
    await this.armorClassInput.fill(data.armorClass.toString());

    if (data.speed !== undefined) {
      await this.speedInput.fill(data.speed.toString());
    }
    if (data.strength !== undefined) {
      await this.strengthInput.fill(data.strength.toString());
    }
    if (data.dexterity !== undefined) {
      await this.dexterityInput.fill(data.dexterity.toString());
    }
    if (data.constitution !== undefined) {
      await this.constitutionInput.fill(data.constitution.toString());
    }
    if (data.intelligence !== undefined) {
      await this.intelligenceInput.fill(data.intelligence.toString());
    }
    if (data.wisdom !== undefined) {
      await this.wisdomInput.fill(data.wisdom.toString());
    }
    if (data.charisma !== undefined) {
      await this.charismaInput.fill(data.charisma.toString());
    }
  }

  /**
   * Create a character with the given data
   */
  async createCharacter(data: {
    name: string;
    maxHp: number;
    armorClass: number;
    speed?: number;
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  }) {
    await this.openCreateCharacterModal();
    await this.fillCharacterForm(data);
    await this.submitButton.click();

    // Wait for modal to close
    await this.page.waitForTimeout(500);
  }

  /**
   * Get a character card by name
   */
  getCharacterCard(name: string): Locator {
    return this.page.getByTestId(`character-card-${name}`);
  }

  /**
   * Edit a character
   */
  async editCharacter(characterName: string, newData: Partial<{
    name: string;
    maxHp: number;
    armorClass: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }>) {
    const card = this.getCharacterCard(characterName);

    // Open dropdown menu first
    const optionsButton = card.getByTestId("character-options-button");
    await optionsButton.click();

    // Dropdown content is rendered in a portal, so use page level locator
    const editButton = this.page.getByTestId("edit-character-button");
    await editButton.click();

    // Wait for form to appear
    await this.page.waitForSelector('[data-testid="character-name-input"]', {
      state: "visible",
    });

    // Fill only the fields that are provided
    if (newData.name !== undefined) {
      await this.characterNameInput.fill(newData.name);
    }
    if (newData.maxHp !== undefined) {
      await this.maxHpInput.fill(newData.maxHp.toString());
    }
    if (newData.armorClass !== undefined) {
      await this.armorClassInput.fill(newData.armorClass.toString());
    }
    if (newData.strength !== undefined) {
      await this.strengthInput.fill(newData.strength.toString());
    }
    if (newData.dexterity !== undefined) {
      await this.dexterityInput.fill(newData.dexterity.toString());
    }
    if (newData.constitution !== undefined) {
      await this.constitutionInput.fill(newData.constitution.toString());
    }
    if (newData.intelligence !== undefined) {
      await this.intelligenceInput.fill(newData.intelligence.toString());
    }
    if (newData.wisdom !== undefined) {
      await this.wisdomInput.fill(newData.wisdom.toString());
    }
    if (newData.charisma !== undefined) {
      await this.charismaInput.fill(newData.charisma.toString());
    }

    await this.submitButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Delete a character
   */
  async deleteCharacter(name: string) {
    const card = this.getCharacterCard(name);

    // Open dropdown menu first
    const optionsButton = card.getByTestId("character-options-button");
    await optionsButton.click();

    // Dropdown content is rendered in a portal, so use page level locator
    const deleteButton = this.page.getByTestId("delete-character-button");
    await deleteButton.click();

    // Confirm deletion
    const confirmButton = this.page.getByTestId("confirm-delete-character");
    await confirmButton.click();

    // Wait for deletion to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if a character exists
   */
  async hasCharacter(name: string): Promise<boolean> {
    const card = this.getCharacterCard(name);
    return await card.isVisible().catch(() => false);
  }

  /**
   * Get calculated initiative value for a character
   */
  async getCalculatedInitiative(characterName: string): Promise<string> {
    const card = this.getCharacterCard(characterName);
    const initiativeDisplay = card.getByTestId("calculated-initiative");
    return await initiativeDisplay.textContent() || "";
  }

  /**
   * Get calculated passive perception for a character
   */
  async getCalculatedPassivePerception(characterName: string): Promise<string> {
    const card = this.getCharacterCard(characterName);
    const ppDisplay = card.getByTestId("calculated-passive-perception");
    return await ppDisplay.textContent() || "";
  }

  /**
   * Get form validation error
   */
  getValidationError(fieldName: string): Locator {
    return this.page.getByTestId(`${fieldName}-error`);
  }
}
