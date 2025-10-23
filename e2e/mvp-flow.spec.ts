import { test, expect } from "./fixtures/base";
import { LoginPage } from "./page-objects/LoginPage";
import { CampaignsPage } from "./page-objects/CampaignsPage";
import { CharactersPage } from "./page-objects/CharactersPage";
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

    // Wait a bit for the update to propagate to prevent hydration mismatch
    await page.waitForTimeout(1000);

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
      speed: 30,
      strength: 16, // +3 modifier
      dexterity: 14, // +2 modifier (initiative)
      constitution: 14,
      intelligence: 10,
      wisdom: 12, // +1 modifier
      charisma: 8,
    };
    await charactersPage.createCharacter(fighter);
    await expect(charactersPage.getCharacterCard(fighter.name)).toBeVisible();

    // Verify initiative calculation (DEX modifier)
    const fighterInitiative = await charactersPage.getCalculatedInitiative(fighter.name);
    expect(fighterInitiative).toContain("+2");

    // Verify passive perception (10 + WIS modifier)
    const fighterPassivePerception = await charactersPage.getCalculatedPassivePerception(fighter.name);
    expect(fighterPassivePerception).toContain("11"); // 10 + 1

    // Create Wizard character
    const wizard = {
      name: generateUniqueName("Wizard"),
      maxHp: 20,
      armorClass: 12,
      speed: 30,
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
      speed: 30,
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

    const wizardPage = new CombatWizardPage(page);

    const combatName = generateUniqueName("MVP Combat Session");
    await wizardPage.createCombat({
      name: combatName,
      characters: [fighter.name, wizard.name, rogue.name],
      monsters: [
        { name: "Goblin", count: 2 },
        { name: "Orc", count: 1 },
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
    // Execute attack action
    await trackerPage.executeAction("Longsword");
    const rollResult = await trackerPage.getLastRollResult();
    expect(rollResult.type).toContain("Attack");
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

    await trackerPage.executeAction("Longsword");
    const advantageRoll = await trackerPage.getLastRollResult();
    expect(advantageRoll.details).toContain("advantage");

    // Test Disadvantage Mode
    await trackerPage.setRollMode("disadvantage");
    mode = await trackerPage.getCurrentRollMode();
    expect(mode).toBe("disadvantage");

    await trackerPage.executeAction("Longsword");
    const disadvantageRoll = await trackerPage.getLastRollResult();
    expect(disadvantageRoll.details).toContain("disadvantage");

    // Reset to normal
    await trackerPage.setRollMode("normal");

    // ===================================================================
    // STEP 12: ROUND MANAGEMENT
    // ===================================================================
    // Cycle through all participants to increment round
    const participantCount = participants.length;
    const currentActiveIndex = participants.indexOf(secondActive);
    const turnsToNextRound = participantCount - currentActiveIndex - 1;

    for (let i = 0; i < turnsToNextRound; i++) {
      await trackerPage.goToNextTurn();
    }

    // Should now be on round 2
    currentRound = await trackerPage.getCurrentRound();
    expect(currentRound).toBe(2);

    // ===================================================================
    // STEP 13: COMBAT PERSISTENCE
    // ===================================================================
    // Save combat state
    await trackerPage.saveCombat();

    // Remember state before reload
    const hpBeforeReload = await trackerPage.getHPValue(fighter.name);
    const conditionsBeforeReload = await trackerPage.hasCondition(rogue.name, "Poisoned");

    // Reload page
    await page.reload();

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

    // Logout
    const logoutButton = page.getByRole("button", {
      name: /log out|logout|sign out/i,
    });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Verify redirected to login
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });

    // Verify truly logged out
    await page.goto("/campaigns");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
