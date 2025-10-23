// Unit tests for InitiativeItem - Combat participant logic
// Tests cover HP delegation, localization, unconscious state, and condition management

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InitiativeItem } from "./InitiativeItem";
import type { CombatParticipantDTO, ConditionDTO } from "@/types";

// ============================================================================
// Mock Setup
// ============================================================================

// Mock child components
vi.mock("./InitiativeBadge", () => ({
  InitiativeBadge: ({ value }: { value: number | null }) => (
    <div data-testid="initiative-badge">{value ?? "-"}</div>
  ),
}));

vi.mock("./ACBadge", () => ({
  ACBadge: ({ value }: { value: number }) => <div data-testid="ac-badge">{value}</div>,
}));

vi.mock("./HPControls", () => ({
  HPControls: ({
    currentHP,
    maxHP,
    onHPChange,
  }: {
    currentHP: number;
    maxHP: number;
    onHPChange: (amount: number, type: "damage" | "heal") => void;
  }) => (
    <div data-testid="hp-controls">
      <span>
        HP: {currentHP}/{maxHP}
      </span>
      <button onClick={() => onHPChange(10, "damage")}>Damage</button>
      <button onClick={() => onHPChange(10, "heal")}>Heal</button>
    </div>
  ),
}));

vi.mock("./ConditionBadge", () => ({
  ConditionBadge: ({
    condition,
    fullCondition,
    onRemove,
  }: {
    condition: { condition_id: string };
    fullCondition: { name: { en: string; pl: string } };
    onRemove: (id: string) => void;
  }) => (
    <div data-testid={`condition-${condition.condition_id}`}>
      {fullCondition.name.en}
      <button onClick={() => onRemove(condition.condition_id)}>Remove</button>
    </div>
  ),
}));

vi.mock("./AddConditionDialog", () => ({
  AddConditionDialog: ({
    isOpen,
    participantName,
    onAdd,
    onCancel,
  }: {
    isOpen: boolean;
    participantName: string;
    onAdd: (conditionId: string, duration: number | null) => void;
    onCancel: () => void;
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="add-condition-dialog">
        <p>Add condition to {participantName}</p>
        <button onClick={() => onAdd("blinded", 3)}>Add Blinded</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  },
}));

// Mock Zustand language store
vi.mock("@/stores/languageStore", () => ({
  useLanguageStore: vi.fn((selector) =>
    selector({
      selectedLanguage: "en",
      setLanguage: vi.fn(),
      toggleLanguage: vi.fn(),
    })
  ),
}));

// ============================================================================
// Test Data
// ============================================================================

const mockConditions: ConditionDTO[] = [
  {
    id: "blinded",
    name: { en: "Blinded", pl: "Oślepiony" },
    description: "A blinded creature can't see.",
  },
  {
    id: "poisoned",
    name: { en: "Poisoned", pl: "Zatruty" },
    description: "A poisoned creature has disadvantage on attack rolls.",
  },
];

const createMockParticipant = (overrides?: Partial<CombatParticipantDTO>): CombatParticipantDTO => ({
  id: "participant-1",
  source: "monster",
  display_name: "Goblin",
  initiative: 15,
  current_hp: 7,
  max_hp: 7,
  armor_class: 15,
  stats: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
  actions: [],
  is_active_turn: false,
  active_conditions: [],
  ...overrides,
});

// ============================================================================
// Tests
// ============================================================================

describe("InitiativeItem", () => {
  const defaultProps = {
    participant: createMockParticipant(),
    isActive: false,
    onUpdate: vi.fn(),
    onRemoveCondition: vi.fn(),
    onAddCondition: vi.fn(),
    conditions: mockConditions,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Tests: Rendering Basic Info
  // ============================================================================

  describe("Rendering Basic Info", () => {
    it("should render participant name", () => {
      render(<InitiativeItem {...defaultProps} />);

      expect(screen.getByText("Goblin")).toBeInTheDocument();
    });

    it("should render participant source", () => {
      render(<InitiativeItem {...defaultProps} />);

      expect(screen.getByText("monster")).toBeInTheDocument();
    });

    it("should render initiative badge", () => {
      render(<InitiativeItem {...defaultProps} />);

      const badge = screen.getByTestId("initiative-badge");
      expect(badge).toHaveTextContent("15");
    });

    it("should render AC badge", () => {
      render(<InitiativeItem {...defaultProps} />);

      const badge = screen.getByTestId("ac-badge");
      expect(badge).toHaveTextContent("15");
    });

    it("should render HP controls", () => {
      render(<InitiativeItem {...defaultProps} />);

      expect(screen.getByTestId("hp-controls")).toBeInTheDocument();
      expect(screen.getByText("HP: 7/7")).toBeInTheDocument();
    });

    it("should render Add Condition button", () => {
      render(<InitiativeItem {...defaultProps} />);

      expect(screen.getByRole("button", { name: /add condition/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Tests: Localization
  // ============================================================================

  describe("Localization", () => {
    it("should display localized name when available (English)", async () => {
      const { useLanguageStore } = vi.mocked(await import("@/stores/languageStore"));
      useLanguageStore.mockImplementation((selector: any) =>
        selector({
          selectedLanguage: "en",
          setLanguage: vi.fn(),
          toggleLanguage: vi.fn(),
        })
      );

      const participant = createMockParticipant({
        display_name: "Goblin",
        display_name_localized: { en: "Goblin", pl: "Goblin" },
      });

      render(<InitiativeItem {...defaultProps} participant={participant} />);

      expect(screen.getByText("Goblin")).toBeInTheDocument();
    });

    it("should display localized name when available (Polish)", async () => {
      const { useLanguageStore } = vi.mocked(await import("@/stores/languageStore"));
      useLanguageStore.mockImplementation((selector: any) =>
        selector({
          selectedLanguage: "pl",
          setLanguage: vi.fn(),
          toggleLanguage: vi.fn(),
        })
      );

      const participant = createMockParticipant({
        display_name: "Goblin",
        display_name_localized: { en: "Goblin", pl: "Goblin" },
      });

      render(<InitiativeItem {...defaultProps} participant={participant} />);

      expect(screen.getByText("Goblin")).toBeInTheDocument();
    });

    it("should fallback to display_name when localized name not available", () => {
      const participant = createMockParticipant({
        display_name: "Custom NPC",
        display_name_localized: undefined,
      });

      render(<InitiativeItem {...defaultProps} participant={participant} />);

      expect(screen.getByText("Custom NPC")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Tests: Unconscious State
  // ============================================================================

  describe("Unconscious State", () => {
    it("should show skull icon when current_hp is 0", () => {
      const participant = createMockParticipant({ current_hp: 0 });

      const { container } = render(<InitiativeItem {...defaultProps} participant={participant} />);

      // Lucide icons are rendered as SVG, check for skull class or presence
      const svg = container.querySelector('svg[class*="lucide-skull"]');
      expect(svg).toBeInTheDocument();
    });

    it("should apply strikethrough to name when unconscious", () => {
      const participant = createMockParticipant({ current_hp: 0 });

      render(<InitiativeItem {...defaultProps} participant={participant} />);

      const nameElement = screen.getByText("Goblin");
      expect(nameElement).toHaveClass("line-through");
    });

    it("should NOT show skull icon when current_hp > 0", () => {
      const participant = createMockParticipant({ current_hp: 5 });

      const { container } = render(<InitiativeItem {...defaultProps} participant={participant} />);

      const svg = container.querySelector('svg[class*="lucide-skull"]');
      expect(svg).not.toBeInTheDocument();
    });

    it("should disable Add Condition button when unconscious", () => {
      const participant = createMockParticipant({ current_hp: 0 });

      render(<InitiativeItem {...defaultProps} participant={participant} />);

      const addButton = screen.getByRole("button", { name: /add condition/i });
      expect(addButton).toBeDisabled();
    });

    it("should NOT disable Add Condition button when conscious", () => {
      const participant = createMockParticipant({ current_hp: 5 });

      render(<InitiativeItem {...defaultProps} participant={participant} />);

      const addButton = screen.getByRole("button", { name: /add condition/i });
      expect(addButton).not.toBeDisabled();
    });
  });

  // ============================================================================
  // Tests: Active State Styling
  // ============================================================================

  describe("Active State Styling", () => {
    it("should apply active styling when isActive is true", () => {
      const { container } = render(<InitiativeItem {...defaultProps} isActive={true} />);

      const wrapper = container.querySelector(".ring-emerald-500");
      expect(wrapper).toBeInTheDocument();
    });

    it("should NOT apply active styling when isActive is false", () => {
      const { container } = render(<InitiativeItem {...defaultProps} isActive={false} />);

      const wrapper = container.querySelector(".ring-emerald-500");
      expect(wrapper).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Tests: HP Change Logic
  // ============================================================================

  describe("HP Change Logic", () => {
    it("should call onUpdate with correct new HP when taking damage", async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      const participant = createMockParticipant({ current_hp: 10, max_hp: 20 });

      render(<InitiativeItem {...defaultProps} participant={participant} onUpdate={onUpdate} />);

      // Click damage button (mocked to reduce by 10)
      await user.click(screen.getByRole("button", { name: /damage/i }));

      // Should call onUpdate with new HP (10 - 10 = 0)
      expect(onUpdate).toHaveBeenCalledWith({ current_hp: 0 });
    });

    it("should call onUpdate with correct new HP when healing", async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      const participant = createMockParticipant({ current_hp: 5, max_hp: 20 });

      render(<InitiativeItem {...defaultProps} participant={participant} onUpdate={onUpdate} />);

      // Click heal button (mocked to add 10)
      await user.click(screen.getByRole("button", { name: /heal/i }));

      // Should call onUpdate with new HP (5 + 10 = 15)
      expect(onUpdate).toHaveBeenCalledWith({ current_hp: 15 });
    });

    it("should not allow HP to go below 0", async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      const participant = createMockParticipant({ current_hp: 5, max_hp: 20 });

      render(<InitiativeItem {...defaultProps} participant={participant} onUpdate={onUpdate} />);

      // Click damage button (would be 5 - 10 = -5, but should clamp to 0)
      await user.click(screen.getByRole("button", { name: /damage/i }));

      expect(onUpdate).toHaveBeenCalledWith({ current_hp: 0 });
    });

    it("should not allow HP to exceed max_hp", async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      const participant = createMockParticipant({ current_hp: 15, max_hp: 20 });

      render(<InitiativeItem {...defaultProps} participant={participant} onUpdate={onUpdate} />);

      // Click heal button (would be 15 + 10 = 25, but should clamp to 20)
      await user.click(screen.getByRole("button", { name: /heal/i }));

      expect(onUpdate).toHaveBeenCalledWith({ current_hp: 20 });
    });

    it("should handle HP at exactly max_hp", async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      const participant = createMockParticipant({ current_hp: 20, max_hp: 20 });

      render(<InitiativeItem {...defaultProps} participant={participant} onUpdate={onUpdate} />);

      // Try to heal at max HP
      await user.click(screen.getByRole("button", { name: /heal/i }));

      // Should remain at max
      expect(onUpdate).toHaveBeenCalledWith({ current_hp: 20 });
    });

    it("should handle HP at exactly 0", async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      const participant = createMockParticipant({ current_hp: 0, max_hp: 20 });

      render(<InitiativeItem {...defaultProps} participant={participant} onUpdate={onUpdate} />);

      // Try to damage at 0 HP
      await user.click(screen.getByRole("button", { name: /damage/i }));

      // Should remain at 0
      expect(onUpdate).toHaveBeenCalledWith({ current_hp: 0 });
    });
  });

  // ============================================================================
  // Tests: Condition Management
  // ============================================================================

  describe("Condition Management", () => {
    it("should render active conditions", () => {
      const participant = createMockParticipant({
        active_conditions: [
          { condition_id: "blinded", name: "Blinded", duration_in_rounds: 3 },
        ],
      });

      render(<InitiativeItem {...defaultProps} participant={participant} />);

      expect(screen.getByTestId("condition-blinded")).toBeInTheDocument();
      expect(screen.getByText("Blinded")).toBeInTheDocument();
    });

    it("should render multiple active conditions", () => {
      const participant = createMockParticipant({
        active_conditions: [
          { condition_id: "blinded", name: "Blinded", duration_in_rounds: 3 },
          { condition_id: "poisoned", name: "Poisoned", duration_in_rounds: null },
        ],
      });

      render(<InitiativeItem {...defaultProps} participant={participant} />);

      expect(screen.getByTestId("condition-blinded")).toBeInTheDocument();
      expect(screen.getByTestId("condition-poisoned")).toBeInTheDocument();
    });

    it("should NOT render conditions that don't exist in conditions list", () => {
      const participant = createMockParticipant({
        active_conditions: [
          { condition_id: "unknown-condition", name: "Unknown", duration_in_rounds: 1 },
        ],
      });

      render(<InitiativeItem {...defaultProps} participant={participant} />);

      expect(screen.queryByTestId("condition-unknown-condition")).not.toBeInTheDocument();
    });

    it("should call onRemoveCondition when removing a condition", async () => {
      const user = userEvent.setup();
      const onRemoveCondition = vi.fn();
      const participant = createMockParticipant({
        active_conditions: [
          { condition_id: "blinded", name: "Blinded", duration_in_rounds: 3 },
        ],
      });

      render(
        <InitiativeItem {...defaultProps} participant={participant} onRemoveCondition={onRemoveCondition} />
      );

      const removeButton = within(screen.getByTestId("condition-blinded")).getByRole("button", {
        name: /remove/i,
      });
      await user.click(removeButton);

      expect(onRemoveCondition).toHaveBeenCalledWith("blinded");
    });

    it("should show Add Condition dialog when button clicked", async () => {
      const user = userEvent.setup();
      render(<InitiativeItem {...defaultProps} />);

      const addButton = screen.getByRole("button", { name: /add condition/i });
      await user.click(addButton);

      expect(screen.getByTestId("add-condition-dialog")).toBeInTheDocument();
    });

    it("should call onAddCondition when adding from dialog", async () => {
      const user = userEvent.setup();
      const onAddCondition = vi.fn();
      render(<InitiativeItem {...defaultProps} onAddCondition={onAddCondition} />);

      // Open dialog
      await user.click(screen.getByRole("button", { name: /add condition/i }));

      // Add condition
      await user.click(screen.getByRole("button", { name: /add blinded/i }));

      expect(onAddCondition).toHaveBeenCalledWith("blinded", 3);
    });

    it("should close dialog after adding condition", async () => {
      const user = userEvent.setup();
      render(<InitiativeItem {...defaultProps} />);

      // Open dialog
      await user.click(screen.getByRole("button", { name: /add condition/i }));
      expect(screen.getByTestId("add-condition-dialog")).toBeInTheDocument();

      // Add condition
      await user.click(screen.getByRole("button", { name: /add blinded/i }));

      // Dialog should be closed
      expect(screen.queryByTestId("add-condition-dialog")).not.toBeInTheDocument();
    });

    it("should close dialog when cancelled", async () => {
      const user = userEvent.setup();
      render(<InitiativeItem {...defaultProps} />);

      // Open dialog
      await user.click(screen.getByRole("button", { name: /add condition/i }));
      expect(screen.getByTestId("add-condition-dialog")).toBeInTheDocument();

      // Cancel
      await user.click(screen.getByRole("button", { name: /cancel/i }));

      // Dialog should be closed
      expect(screen.queryByTestId("add-condition-dialog")).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Tests: Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle participant with null initiative", () => {
      const participant = createMockParticipant({ initiative: null });

      render(<InitiativeItem {...defaultProps} participant={participant} />);

      const badge = screen.getByTestId("initiative-badge");
      expect(badge).toHaveTextContent("-");
    });

    it("should handle participant with ad_hoc_npc source", () => {
      const participant = createMockParticipant({ source: "ad_hoc_npc" });

      render(<InitiativeItem {...defaultProps} participant={participant} />);

      expect(screen.getByText("ad hoc npc")).toBeInTheDocument();
    });

    it("should handle participant with player_character source", () => {
      const participant = createMockParticipant({ source: "player_character" });

      render(<InitiativeItem {...defaultProps} participant={participant} />);

      expect(screen.getByText("player character")).toBeInTheDocument();
    });

    it("should handle empty active_conditions array", () => {
      const participant = createMockParticipant({ active_conditions: [] });

      const { container } = render(<InitiativeItem {...defaultProps} participant={participant} />);

      // Should not render any condition badges
      expect(container.querySelector('[data-testid^="condition-"]')).not.toBeInTheDocument();
    });

    it("should handle very long participant names", () => {
      const participant = createMockParticipant({
        display_name: "A Very Long Participant Name That Should Truncate Properly",
      });

      render(<InitiativeItem {...defaultProps} participant={participant} />);

      const nameElement = screen.getByText("A Very Long Participant Name That Should Truncate Properly");
      expect(nameElement).toHaveClass("truncate");
    });
  });
});
