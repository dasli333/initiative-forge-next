import { test, expect } from "./fixtures/base";
import { LoginPage } from "./page-objects/LoginPage";
import { CampaignsPage } from "./page-objects/CampaignsPage";
import { CharactersPage } from "./page-objects/CharactersPage";
import { CombatsPage } from "./page-objects/CombatsPage";
import { CombatWizardPage } from "./page-objects/CombatWizardPage";
import { CombatTrackerPage } from "./page-objects/CombatTrackerPage";
import { Sidebar } from "./page-objects/Sidebar";
import { getTestUser } from "./utils/auth.helpers";
import { generateUniqueName } from "./utils/testHelpers";

/**
 * MVP Flow Test - Complete happy path testing all main features
 *
 * This comprehensive test validates the entire user journey through the application:
 * 1. Authentication (login)
 * 2. Campaign management (create, edit)
 * 3. Character management (create multiple characters with different stats)
 * 4. Combat creation (wizard flow with characters and monsters)
 * 5. Initiative system (rolling and sorting)
 * 6. Turn management (active participant, round counter)
 * 7. HP management (damage, healing, bounds)
 * 8. Condition system (add, remove)
 * 9. Combat actions (attack rolls, damage rolls)
 * 10. Roll modes (normal, advantage, disadvantage)
 * 11. Persistence (save and reload)
 * 12. Cleanup (logout)
 */
test.describe("MVP Complete Flow", () => {
  test("TC-MVP-01: Complete application flow from login to logout", async ({ page }) => {
    // Set longer timeout for this comprehensive test
    test.setTimeout(120000); // 2 minutes
    // ===================================================================
    // STEP 1: AUTHENTICATION
    // ===================================================================
    const loginPage = new LoginPage(page);
    const { username, password } = getTestUser();

    await loginPage.goto();
    await loginPage.login(username, password);
    await loginPage.waitForRedirectFromLogin();
    await expect(page).toHaveURL(/\/campaigns/);

    // ===================================================================
    // STEP 2: CAMPAIGN CREATION
    // ===================================================================
    const campaignsPage = new CampaignsPage(page);
    const campaignName = generateUniqueName("MVP Test Campaign");

    await campaignsPage.createCampaign(campaignName);
    await expect(campaignsPage.getCampaignCard(campaignName)).toBeVisible();

    // ===================================================================
    // STEP 3: CAMPAIGN EDITING
    // ===================================================================
    const updatedCampaignName = generateUniqueName("Updated MVP Campaign");
    await campaignsPage.editCampaignName(campaignName, updatedCampaignName);
    await expect(campaignsPage.getCampaignCard(updatedCampaignName)).toBeVisible();

    // Wait for the update to propagate by waiting for network idle
    await page.waitForLoadState("networkidle");

    // ===================================================================
    // STEP 3.5: SIDEBAR VERIFICATION & NAVIGATION
    // ===================================================================
    const sidebar = new Sidebar(page);

    // Open the campaign to access characters
    await campaignsPage.openCampaign(updatedCampaignName);
    await expect(page).toHaveURL(/\/campaigns\/[a-f0-9-]+$/);

    // Extract campaign ID from URL
    const campaignUrl = page.url();
    const campaignIdMatch = campaignUrl.match(/\/campaigns\/([a-f0-9-]+)$/);
    const campaignId = campaignIdMatch?.[1];
    expect(campaignId).toBeTruthy();

    // Verify sidebar updated with selected campaign
    await sidebar.waitForCampaignName(updatedCampaignName);
    const currentCampaign = await sidebar.getCurrentCampaignName();
    expect(currentCampaign).toBe(updatedCampaignName);

    // Verify campaign navigation is visible
    await sidebar.waitForCampaignNav();
    const hasCampaignNav = await sidebar.isCampaignNavVisible();
    expect(hasCampaignNav).toBe(true);

    // ===================================================================
    // STEP 4: CHARACTER CREATION
    // ===================================================================
    const charactersPage = new CharactersPage(page);

    // Use sidebar navigation instead of direct URL
    await sidebar.goToPlayerCharacters();
    await expect(page).toHaveURL(`/campaigns/${campaignId}/characters`);

    // Create Fighter character
    const fighter = {
      name: generateUniqueName("Fighter"),
      maxHp: 30,
      armorClass: 16,
      strength: 16, // +3 modifier
      dexterity: 14, // +2 modifier (initiative)
      constitution: 14,
      intelligence: 10,
      wisdom: 12, // +1 modifier
      charisma: 8,
    };
    await charactersPage.createCharacter(fighter);
    await expect(charactersPage.getCharacterCard(fighter.name)).toBeVisible();

    // Create Wizard character
    const wizard = {
      name: generateUniqueName("Wizard"),
      maxHp: 20,
      armorClass: 12,
      strength: 8,
      dexterity: 12, // +1 modifier (initiative)
      constitution: 10,
      intelligence: 16, // +3 modifier
      wisdom: 14, // +2 modifier
      charisma: 10,
    };
    await charactersPage.createCharacter(wizard);
    await expect(charactersPage.getCharacterCard(wizard.name)).toBeVisible();

    // Create Rogue character
    const rogue = {
      name: generateUniqueName("Rogue"),
      maxHp: 25,
      armorClass: 15,
      strength: 10,
      dexterity: 18, // +4 modifier (initiative)
      constitution: 12,
      intelligence: 12,
      wisdom: 13, // +1 modifier
      charisma: 14,
    };
    await charactersPage.createCharacter(rogue);
    await expect(charactersPage.getCharacterCard(rogue.name)).toBeVisible();

    // ===================================================================
    // STEP 5: COMBAT CREATION
    // ===================================================================
    // Navigate to combat using sidebar
    await sidebar.goToCombat();
    await expect(page).toHaveURL(`/campaigns/${campaignId}/combats`);

    // Click "Start New Combat" button to open the wizard
    const combatsPage = new CombatsPage(page);
    await combatsPage.clickCreateCombat();
    await expect(page).toHaveURL(`/campaigns/${campaignId}/combats/new`);

    const wizardPage = new CombatWizardPage(page);

    const combatName = generateUniqueName("MVP Combat Session");
    await wizardPage.createCombat({
      name: combatName,
      characters: [fighter.name, wizard.name, rogue.name],
      monsters: [
        { name: "Goblin Warrior", count: 2 },
        { name: "Hobgoblin Warrior", count: 1 },
      ],
    });

    // Should redirect to combat tracker
    await expect(page).toHaveURL(/\/combats\/[a-f0-9-]+$/);

    // Extract combat ID from URL
    const combatUrl = page.url();
    const combatIdMatch = combatUrl.match(/\/combats\/([a-f0-9-]+)$/);
    const combatId = combatIdMatch?.[1];
    expect(combatId).toBeTruthy();

    // ===================================================================
    // STEP 6: INITIATIVE SYSTEM
    // ===================================================================
    const trackerPage = new CombatTrackerPage(page);

    // Roll initiative for all participants
    await trackerPage.rollInitiative();

    // Verify all participants have initiative values and are sorted
    const participants = await trackerPage.getParticipantsInOrder();
    expect(participants.length).toBeGreaterThanOrEqual(6); // 3 characters + 3 monsters

    // Verify initiative values are in descending order
    let previousInitiative = 99;
    for (const participant of participants) {
      const initiative = await trackerPage.getInitiativeValue(participant);
      expect(initiative).toBeLessThanOrEqual(previousInitiative);
      previousInitiative = initiative;
    }

    // ===================================================================
    // STEP 7: COMBAT START & TURN MANAGEMENT
    // ===================================================================
    await trackerPage.startCombat();

    // Verify first participant is active
    const firstActive = await trackerPage.getActiveParticipantName();
    expect(firstActive).toBeTruthy();
    expect(firstActive).toBe(participants[0]); // Should be the first in sorted order

    // Verify we're on round 1
    let currentRound = await trackerPage.getCurrentRound();
    expect(currentRound).toBe(1);

    // Go to next turn
    await trackerPage.goToNextTurn();
    const secondActive = await trackerPage.getActiveParticipantName();
    expect(secondActive).toBeTruthy();
    expect(secondActive).not.toBe(firstActive);
    expect(secondActive).toBe(participants[1]);

    // ===================================================================
    // STEP 8: HP MANAGEMENT
    // ===================================================================
    // Test damage on Fighter
    const fighterInitialHP = await trackerPage.getHPValue(fighter.name);
    expect(fighterInitialHP.current).toBe(fighter.maxHp);
    expect(fighterInitialHP.max).toBe(fighter.maxHp);

    // Apply damage
    await trackerPage.applyDamage(fighter.name, 10);
    const fighterAfterDamage = await trackerPage.getHPValue(fighter.name);
    expect(fighterAfterDamage.current).toBe(fighter.maxHp - 10);

    // Verify progress bar color changes
    const colorAfterDamage = await trackerPage.getHPProgressBarColor(fighter.name);
    expect(colorAfterDamage).toBeTruthy();

    // Apply healing
    await trackerPage.applyHealing(fighter.name, 5);
    const fighterAfterHealing = await trackerPage.getHPValue(fighter.name);
    expect(fighterAfterHealing.current).toBe(fighter.maxHp - 5);

    // Test HP bounds - massive damage
    await trackerPage.applyDamage(wizard.name, 9999);
    const wizardAfterMassiveDamage = await trackerPage.getHPValue(wizard.name);
    expect(wizardAfterMassiveDamage.current).toBe(0); // Should be clamped to 0

    // Test HP bounds - massive healing
    await trackerPage.applyHealing(wizard.name, 9999);
    const wizardAfterMassiveHealing = await trackerPage.getHPValue(wizard.name);
    expect(wizardAfterMassiveHealing.current).toBe(wizard.maxHp); // Should be clamped to max

    // ===================================================================
    // STEP 9: CONDITION MANAGEMENT
    // ===================================================================
    // Add condition to Rogue
    await trackerPage.addCondition(rogue.name, "Poisoned", 3);
    let hasCondition = await trackerPage.hasCondition(rogue.name, "Poisoned");
    expect(hasCondition).toBe(true);

    // Add another condition
    await trackerPage.addCondition(rogue.name, "Prone");
    hasCondition = await trackerPage.hasCondition(rogue.name, "Prone");
    expect(hasCondition).toBe(true);

    // Remove condition
    await trackerPage.removeCondition(rogue.name, "Prone");
    hasCondition = await trackerPage.hasCondition(rogue.name, "Prone");
    expect(hasCondition).toBe(false);

    // Poisoned should still be there
    hasCondition = await trackerPage.hasCondition(rogue.name, "Poisoned");
    expect(hasCondition).toBe(true);

    // ===================================================================
    // STEP 10: COMBAT ACTIONS & ROLLS
    // ===================================================================
    // Find participant with Longsword action (Hobgoblin)
    await trackerPage.goToParticipantWithAction("Longsword");

    // Execute attack action
    await trackerPage.executeAction("Longsword");
    const rollResult = await trackerPage.getLastRollResult();
    expect(rollResult.type.toLowerCase()).toContain("attack");
    expect(rollResult.total).toBeGreaterThan(0);
    expect(rollResult.details).toBeTruthy();

    // ===================================================================
    // STEP 11: ROLL MODES (ADVANTAGE/DISADVANTAGE)
    // ===================================================================
    // Test Normal Mode
    await trackerPage.setRollMode("normal");
    let mode = await trackerPage.getCurrentRollMode();
    expect(mode).toBe("normal");

    // Test Advantage Mode
    await trackerPage.setRollMode("advantage");
    mode = await trackerPage.getCurrentRollMode();
    expect(mode).toBe("advantage");

    // Find participant with Longsword action (Hobgoblin)
    await trackerPage.goToParticipantWithAction("Longsword");

    await trackerPage.executeAction("Longsword");
    const advantageRoll = await trackerPage.getLastRollResult();
    // Advantage shows 2 rolls (e.g., "Roll: 5, 16")
    expect(advantageRoll.details).toMatch(/\d+,\s*\d+/);

    // Test Disadvantage Mode
    await trackerPage.setRollMode("disadvantage");
    mode = await trackerPage.getCurrentRollMode();
    expect(mode).toBe("disadvantage");

    // Find participant with Longsword action (Hobgoblin)
    await trackerPage.goToParticipantWithAction("Longsword");

    await trackerPage.executeAction("Longsword");
    const disadvantageRoll = await trackerPage.getLastRollResult();
    // Disadvantage shows 2 rolls (e.g., "Roll: 5, 16")
    expect(disadvantageRoll.details).toMatch(/\d+,\s*\d+/);

    // Reset to normal
    await trackerPage.setRollMode("normal");

    // ===================================================================
    // STEP 12: ROUND MANAGEMENT
    // ===================================================================
    // Cycle through all participants to increment round
    // Get the CURRENT active participant (not stale secondActive)
    const currentActiveParticipant = await trackerPage.getActiveParticipantName();
    const participantCount = participants.length;
    const currentActiveIndex = participants.indexOf(currentActiveParticipant);

    // Verify the active participant is in our list
    expect(currentActiveIndex).toBeGreaterThanOrEqual(0);

    // Calculate turns needed to reach round 2
    // If at index N, need (participantCount - N) turns to reach index 0 of next round
    const turnsToNextRound = participantCount - currentActiveIndex;
    console.log(`Round management: current="${currentActiveParticipant}" at index ${currentActiveIndex}/${participantCount}, advancing ${turnsToNextRound} turns`);

    // Check current round before advancing
    const roundBeforeAdvancing = await trackerPage.getCurrentRound();
    console.log(`Current round before advancing: ${roundBeforeAdvancing}`);

    for (let i = 0; i < turnsToNextRound; i++) {
      await trackerPage.goToNextTurn();
      const roundAfterTurn = await trackerPage.getCurrentRound();
      const activeAfterTurn = await trackerPage.getActiveParticipantName();
      console.log(`After turn ${i + 1}/${turnsToNextRound}: Round ${roundAfterTurn}, Active: ${activeAfterTurn}`);
    }

    // Wait for round counter to update to round 2
    await expect(page.locator('[data-testid="round-counter"]')).toContainText("2", { timeout: 5000 });

    // Should now be on round 2
    currentRound = await trackerPage.getCurrentRound();
    console.log(`Final round: ${currentRound}`);
    expect(currentRound).toBe(2);

    // ===================================================================
    // STEP 13: COMBAT PERSISTENCE
    // ===================================================================
    // Save combat state
    await trackerPage.saveCombat();

    // Remember state before reload
    const hpBeforeReload = await trackerPage.getHPValue(fighter.name);
    const conditionsBeforeReload = await trackerPage.hasCondition(rogue.name, "Poisoned");

    // Reload page with extended timeout and wait for key element
    try {
      await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
    } catch (error) {
      // If reload fails, try direct navigation as fallback
      console.log("Reload timed out, trying direct navigation");
      await page.goto(combatUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    }

    // Wait for combat tracker to be fully loaded and state hydrated
    await page.waitForSelector('[data-testid="round-counter"]', { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Ensure round counter shows the correct value after hydration
    await expect(page.locator('[data-testid="round-counter"]')).toContainText("2", { timeout: 5000 });

    // Verify state persisted
    const hpAfterReload = await trackerPage.getHPValue(fighter.name);
    expect(hpAfterReload.current).toBe(hpBeforeReload.current);
    expect(hpAfterReload.max).toBe(hpBeforeReload.max);

    const conditionsAfterReload = await trackerPage.hasCondition(rogue.name, "Poisoned");
    expect(conditionsAfterReload).toBe(conditionsBeforeReload);

    const roundAfterReload = await trackerPage.getCurrentRound();
    expect(roundAfterReload).toBe(2);

    // ===================================================================
    // STEP 14: CLEANUP & LOGOUT
    // ===================================================================
    // Navigate back to campaigns
    await page.goto("/campaigns");
    await expect(page).toHaveURL(/\/campaigns/);

    // Delete the test campaign (cascades to characters and combats)
    await campaignsPage.deleteCampaign(updatedCampaignName);
    const hasCampaign = await campaignsPage.hasCampaign(updatedCampaignName);
    expect(hasCampaign).toBe(false);

    // Logout - first click user menu to reveal logout button
    const userMenuButton = page.getByTestId("user-menu-trigger");
    await expect(userMenuButton).toBeVisible();
    await userMenuButton.click();

    // Now click logout using data-testid
    const logoutButton = page.getByTestId("logout-button");
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Verify redirected to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

    // Verify truly logged out
    await page.goto("/campaigns");
    await expect(page).toHaveURL(/\/login/);
  });
});
