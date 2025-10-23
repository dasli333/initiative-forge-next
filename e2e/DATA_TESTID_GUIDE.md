# Data-testid Attributes Guide for E2E Tests

This document lists all the data-testid attributes that need to be added to components for E2E testing.

## ✅ Sidebar Navigation (COMPLETED)

### Current Campaign Display (CurrentCampaignDisplay.tsx)
- `data-testid="current-campaign-display"` - Container for current campaign section
- `data-testid="current-campaign-name"` - Currently selected campaign name
- `data-testid="select-campaign-link"` - Link to select a campaign (when none selected)

### Campaign Navigation (CampaignNav.tsx)
- `data-testid="campaign-nav"` - Container for campaign-specific navigation

### Navigation Items (NavItem.tsx)
Auto-generated from label: `data-testid="nav-{label-kebab-case}"`

**Campaign Navigation:**
- `data-testid="nav-campaign-home"` - Link to campaign home page
- `data-testid="nav-combat"` - Link to combat page
- `data-testid="nav-player-characters"` - Link to player characters page

**Global Navigation:**
- `data-testid="nav-my-campaigns"` - Link to campaigns list
- `data-testid="nav-spells-library"` - Link to spells library
- `data-testid="nav-monsters-library"` - Link to monsters library

### General Sidebar (SidebarContent.tsx)
- `data-testid="sidebar"` - Main sidebar container

## ✅ Campaign Components (COMPLETED)

### CreateCampaignModal.tsx
- `data-testid="campaign-name-input"` - Campaign name input field
- `data-testid="confirm-create-campaign"` - Confirm create button

### PlusTile.tsx
- `data-testid="create-campaign-button"` - Plus tile card

### CampaignCard.tsx
- `data-testid="campaign-card-{campaign.name}"` - Campaign card container
- `data-testid="edit-campaign-name"` - Edit menu item
- `data-testid="delete-campaign-button"` - Delete menu item

### EditableTitle.tsx
- `data-testid="campaign-name-edit-input"` - Editable title input
- `data-testid="save-campaign-name"` - Save button (if exists)

### DeleteCampaignModal.tsx
- `data-testid="confirm-delete-campaign"` - Confirm delete button

## ⚠️ Character Components (IN PROGRESS)

### CharacterForm.tsx
Add to BasicInfoSection:
- `data-testid="character-name-input"` - Name input
- `data-testid="character-max-hp-input"` - Max HP input
- `data-testid="character-ac-input"` - Armor Class input
- `data-testid="character-speed-input"` - Speed input

Add to AbilityScoresSection:
- `data-testid="character-str-input"` - Strength input
- `data-testid="character-dex-input"` - Dexterity input
- `data-testid="character-con-input"` - Constitution input
- `data-testid="character-int-input"` - Intelligence input
- `data-testid="character-wis-input"` - Wisdom input
- `data-testid="character-cha-input"` - Charisma input

Add to AutoCalculatedDisplays:
- `data-testid="calculated-initiative"` - Initiative display
- `data-testid="calculated-passive-perception"` - Passive Perception display

Add to form:
- `data-testid="submit-character-form"` - Submit button

Add validation errors:
- `data-testid="{fieldName}-error"` - For each field error

### CharacterFormModal.tsx
- `data-testid="create-character-button"` - Open modal button (if exists)
- `data-testid="edit-character-button"` - Edit button in character card
- `data-testid="delete-character-button"` - Delete button in character card
- `data-testid="confirm-delete-character"` - Confirm delete in modal

### Character Card/List (if separate component)
- `data-testid="character-card-{character.name}"` - Character card container

## ⚠️ Combat Wizard Components (PENDING)

### Step1_CombatName.tsx
- `data-testid="combat-name-input"` - Combat name input

### Step2_SelectPlayerCharacters.tsx
- `data-testid="character-checkbox-{character.name}"` - Character selection checkbox

### Step3_AddMonsters.tsx
- `data-testid="monster-search-input"` - Monster search input
- `data-testid="monster-card-{monster.name}"` - Monster card
- `data-testid="add-monster-{monster.name}"` - Add monster button
- `data-testid="monster-count-{monster.name}"` - Monster count input

### Step5_Summary.tsx
- `data-testid="combat-summary-participants"` - Participant count display

### Wizard Navigation
- `data-testid="wizard-next-button"` - Next step button
- `data-testid="wizard-back-button"` - Previous step button
- `data-testid="create-combat-button"` - Final create button
- `data-testid="step-indicator-{stepNumber}"` - Step indicators (1-5) with `data-active` attribute

## ⚠️ Combat Tracker Components (PENDING)

### CombatControlBar.tsx
- `data-testid="roll-initiative-button"` - Roll initiative button
- `data-testid="start-combat-button"` - Start combat button
- `data-testid="next-turn-button"` - Next turn button
- `data-testid="save-combat-button"` - Save combat button
- `data-testid="back-button"` - Back navigation button

### RoundCounter.tsx
- `data-testid="round-counter"` - Round number display

### InitiativeList.tsx / InitiativeItem.tsx
- `data-testid="initiative-item-{participant.name}"` - Initiative item container with `data-active="true|false"`
- `data-testid="initiative-badge"` - Initiative value badge
- `data-testid="hp-display"` - HP display (current/max)
- `data-testid="hp-amount-input"` - HP change amount input
- `data-testid="hp-damage-button"` - Apply damage button
- `data-testid="hp-heal-button"` - Apply healing button
- `data-testid="hp-progress-bar"` - HP visual progress bar
- `data-testid="add-condition-button"` - Add condition button

### AddConditionDialog.tsx
- `data-testid="condition-select"` - Condition dropdown/select
- `data-testid="condition-duration-input"` - Duration input
- `data-testid="confirm-add-condition"` - Confirm add button

### ConditionBadge.tsx
- `data-testid="condition-badge-{condition.name}"` - Condition badge
- `data-testid="remove-condition-button"` - Remove condition button (on hover)

### RollControls.tsx
- `data-testid="roll-mode-normal"` - Normal roll mode button with `data-active`
- `data-testid="roll-mode-advantage"` - Advantage roll mode button with `data-active`
- `data-testid="roll-mode-disadvantage"` - Disadvantage roll mode button with `data-active`

### RollLog.tsx
- `data-testid="roll-log"` - Roll log container
- `data-testid="roll-card-{index}"` - Individual roll card
- `data-testid="roll-type"` - Roll type (e.g., "Attack")
- `data-testid="roll-total"` - Roll total value
- `data-testid="roll-details"` - Roll details/breakdown

### ActionButton.tsx (in character sheet)
- `data-testid="action-button-{action.name}"` - Clickable action button

## Implementation Notes

1. **Dynamic data-testid values**: Use template literals for dynamic values (e.g., participant names, condition names)
2. **State attributes**: Use additional `data-active`, `data-selected` etc. where state needs to be tested
3. **Normalize names**: Convert names to kebab-case or remove spaces if needed for valid HTML attributes
4. **Fallback selectors**: Page Objects should still use accessible selectors (getByRole, getByLabel) as primary, with data-testid as fallback

## Testing Checklist

- [ ] All character form inputs have data-testid
- [ ] Character form validation errors are identifiable
- [ ] Combat wizard step navigation is testable
- [ ] Initiative list items are uniquely identifiable
- [ ] HP controls are fully testable
- [ ] Condition management is fully testable
- [ ] Roll log entries are accessible
- [ ] All modals have confirm/cancel buttons with data-testid
