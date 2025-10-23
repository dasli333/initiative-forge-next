// Unit tests for AddConditionDialog - Condition form logic
// Tests cover filtering, duration conversion, validation, and form state management

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddConditionDialog } from "./AddConditionDialog";
import type { ConditionDTO } from "@/types";

// ============================================================================
// Test Data
// ============================================================================

const mockConditions: ConditionDTO[] = [
  {
    id: "blinded",
    name: { en: "Blinded", pl: "Oślepiony" },
    description: "A blinded creature can't see and automatically fails any ability check that requires sight.",
  },
  {
    id: "charmed",
    name: { en: "Charmed", pl: "Oczarowany" },
    description: "A charmed creature can't attack the charmer or target the charmer with harmful abilities.",
  },
  {
    id: "deafened",
    name: { en: "Deafened", pl: "Ogłuszony" },
    description: "A deafened creature can't hear and automatically fails any ability check that requires hearing.",
  },
  {
    id: "frightened",
    name: { en: "Frightened", pl: "Przerażony" },
    description: "A frightened creature has disadvantage on ability checks and attack rolls.",
  },
  {
    id: "poisoned",
    name: { en: "Poisoned", pl: "Zatruty" },
    description: "A poisoned creature has disadvantage on attack rolls and ability checks.",
  },
];

// ============================================================================
// Tests
// ============================================================================

describe("AddConditionDialog", () => {
  const defaultProps = {
    isOpen: true,
    participantName: "Goblin",
    conditions: mockConditions,
    existingConditionIds: [],
    onAdd: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Tests: Rendering & Initial State
  // ============================================================================

  describe("Rendering & Initial State", () => {
    it("should render when isOpen is true", () => {
      render(<AddConditionDialog {...defaultProps} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Add Condition" })).toBeInTheDocument();
    });

    it("should NOT render when isOpen is false", () => {
      render(<AddConditionDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should display participant name in description", () => {
      render(<AddConditionDialog {...defaultProps} participantName="Ancient Dragon" />);

      expect(screen.getByText(/add a condition to ancient dragon/i)).toBeInTheDocument();
    });

    it("should render condition select field", () => {
      render(<AddConditionDialog {...defaultProps} />);

      expect(screen.getByLabelText("Condition")).toBeInTheDocument();
    });

    it("should render duration input field", () => {
      render(<AddConditionDialog {...defaultProps} />);

      expect(screen.getByLabelText(/duration \(rounds\)/i)).toBeInTheDocument();
    });

    it("should render Add Condition and Cancel buttons", () => {
      render(<AddConditionDialog {...defaultProps} />);

      expect(screen.getByRole("button", { name: /add condition/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("should have Add Condition button disabled initially (no selection)", () => {
      render(<AddConditionDialog {...defaultProps} />);

      const addButton = screen.getByRole("button", { name: /add condition/i });
      expect(addButton).toBeDisabled();
    });

    it("should have duration input with placeholder 'Indefinite'", () => {
      render(<AddConditionDialog {...defaultProps} />);

      const durationInput = screen.getByLabelText(/duration \(rounds\)/i);
      expect(durationInput).toHaveAttribute("placeholder", "Indefinite");
    });

    it("should show helper text for indefinite duration", () => {
      render(<AddConditionDialog {...defaultProps} />);

      expect(screen.getByText(/leave empty for indefinite duration/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Tests: Condition Filtering
  // ============================================================================

  describe("Condition Filtering", () => {
    it("should show all conditions when none are applied", async () => {
      const user = userEvent.setup();
      render(<AddConditionDialog {...defaultProps} />);

      // Open select
      const select = screen.getByRole("combobox");
      await user.click(select);

      // All 5 conditions should be available
      expect(screen.getByRole("option", { name: /oślepiony/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /oczarowany/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /ogłuszony/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /przerażony/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /zatruty/i })).toBeInTheDocument();
    });

    it("should filter out existing conditions", async () => {
      const user = userEvent.setup();
      render(<AddConditionDialog {...defaultProps} existingConditionIds={["blinded", "charmed"]} />);

      // Open select
      const select = screen.getByRole("combobox");
      await user.click(select);

      // Blinded and Charmed should NOT be available
      expect(screen.queryByRole("option", { name: /oślepiony/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("option", { name: /oczarowany/i })).not.toBeInTheDocument();

      // Other conditions should be available
      expect(screen.getByRole("option", { name: /ogłuszony/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /przerażony/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /zatruty/i })).toBeInTheDocument();
    });

    it("should show message when all conditions are applied", async () => {
      const user = userEvent.setup();
      const allConditionIds = mockConditions.map((c) => c.id);
      render(<AddConditionDialog {...defaultProps} existingConditionIds={allConditionIds} />);

      // Open select
      const select = screen.getByRole("combobox");
      await user.click(select);

      expect(screen.getByText(/all conditions already applied/i)).toBeInTheDocument();
    });

    it("should disable Add button when all conditions are applied", () => {
      const allConditionIds = mockConditions.map((c) => c.id);
      render(<AddConditionDialog {...defaultProps} existingConditionIds={allConditionIds} />);

      const addButton = screen.getByRole("button", { name: /add condition/i });
      expect(addButton).toBeDisabled();
    });
  });

  // ============================================================================
  // Tests: Condition Selection
  // ============================================================================

  describe("Condition Selection", () => {
    it("should enable Add button when condition is selected", async () => {
      const user = userEvent.setup();
      render(<AddConditionDialog {...defaultProps} />);

      // Select a condition
      const select = screen.getByRole("combobox");
      await user.click(select);
      await user.click(screen.getByRole("option", { name: /oślepiony/i }));

      const addButton = screen.getByRole("button", { name: /add condition/i });
      expect(addButton).toBeEnabled();
    });

    it("should show condition description preview when selected", async () => {
      const user = userEvent.setup();
      render(<AddConditionDialog {...defaultProps} />);

      // Select a condition
      const select = screen.getByRole("combobox");
      await user.click(select);
      await user.click(screen.getByRole("option", { name: /oślepiony/i }));

      // Should show preview
      expect(
        screen.getByText(/a blinded creature can't see and automatically fails/i)
      ).toBeInTheDocument();
    });

    it("should NOT show preview when no condition is selected", () => {
      render(<AddConditionDialog {...defaultProps} />);

      // Description preview should not be visible
      expect(screen.queryByText(/a blinded creature/i)).not.toBeInTheDocument();
    });

    it("should update preview when changing selection", async () => {
      const user = userEvent.setup();
      render(<AddConditionDialog {...defaultProps} />);

      const select = screen.getByRole("combobox");

      // Select first condition
      await user.click(select);
      await user.click(screen.getByRole("option", { name: /oślepiony/i }));
      expect(screen.getByText(/a blinded creature/i)).toBeInTheDocument();

      // Change to another condition
      await user.click(select);
      await user.click(screen.getByRole("option", { name: /zatruty/i }));
      expect(screen.getByText(/a poisoned creature/i)).toBeInTheDocument();
      expect(screen.queryByText(/a blinded creature/i)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Tests: Duration Input
  // ============================================================================

  describe("Duration Input", () => {
    it("should accept numeric duration", async () => {
      const user = userEvent.setup();
      render(<AddConditionDialog {...defaultProps} />);

      const durationInput = screen.getByLabelText(/duration \(rounds\)/i);
      await user.type(durationInput, "5");

      expect(durationInput).toHaveValue(5);
    });

    it("should accept empty duration (indefinite)", () => {
      render(<AddConditionDialog {...defaultProps} />);

      const durationInput = screen.getByLabelText(/duration \(rounds\)/i) as HTMLInputElement;
      expect(durationInput.value).toBe("");
    });

    it("should have min and max constraints", () => {
      render(<AddConditionDialog {...defaultProps} />);

      const durationInput = screen.getByLabelText(/duration \(rounds\)/i);
      expect(durationInput).toHaveAttribute("min", "1");
      expect(durationInput).toHaveAttribute("max", "99");
    });

    it("should allow clearing duration after entering a value", async () => {
      const user = userEvent.setup();
      render(<AddConditionDialog {...defaultProps} />);

      const durationInput = screen.getByLabelText(/duration \(rounds\)/i);
      await user.type(durationInput, "10");
      expect(durationInput).toHaveValue(10);

      await user.clear(durationInput);
      expect(durationInput).toHaveValue(null);
    });
  });

  // ============================================================================
  // Tests: Adding Condition
  // ============================================================================

  describe("Adding Condition", () => {
    it("should call onAdd with condition ID and duration", async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(<AddConditionDialog {...defaultProps} onAdd={onAdd} />);

      // Select condition
      const select = screen.getByRole("combobox");
      await user.click(select);
      await user.click(screen.getByRole("option", { name: /oślepiony/i }));

      // Enter duration
      const durationInput = screen.getByLabelText(/duration \(rounds\)/i);
      await user.type(durationInput, "3");

      // Click Add
      await user.click(screen.getByRole("button", { name: /add condition/i }));

      expect(onAdd).toHaveBeenCalledWith("blinded", 3);
    });

    it("should call onAdd with null duration when empty (indefinite)", async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(<AddConditionDialog {...defaultProps} onAdd={onAdd} />);

      // Select condition
      const select = screen.getByRole("combobox");
      await user.click(select);
      await user.click(screen.getByRole("option", { name: /zatruty/i }));

      // Don't enter duration (leave empty)

      // Click Add
      await user.click(screen.getByRole("button", { name: /add condition/i }));

      expect(onAdd).toHaveBeenCalledWith("poisoned", null);
    });

    it("should NOT call onAdd when no condition is selected", async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(<AddConditionDialog {...defaultProps} onAdd={onAdd} />);

      // Don't select any condition

      // Try to click Add (should be disabled)
      const addButton = screen.getByRole("button", { name: /add condition/i });
      expect(addButton).toBeDisabled();

      // Force click shouldn't work due to disabled state
      await user.click(addButton);
      expect(onAdd).not.toHaveBeenCalled();
    });

    it("should handle large duration values", async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(<AddConditionDialog {...defaultProps} onAdd={onAdd} />);

      const select = screen.getByRole("combobox");
      await user.click(select);
      await user.click(screen.getByRole("option", { name: /oślepiony/i }));

      const durationInput = screen.getByLabelText(/duration \(rounds\)/i);
      await user.type(durationInput, "99");

      await user.click(screen.getByRole("button", { name: /add condition/i }));

      expect(onAdd).toHaveBeenCalledWith("blinded", 99);
    });
  });

  // ============================================================================
  // Tests: Form Reset
  // ============================================================================

  describe("Form Reset", () => {
    it("should reset form after adding condition", async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();

      const { rerender } = render(<AddConditionDialog {...defaultProps} onAdd={onAdd} />);

      // Select condition and duration
      const select = screen.getByRole("combobox");
      await user.click(select);
      await user.click(screen.getByRole("option", { name: /oślepiony/i }));

      const durationInput = screen.getByLabelText(/duration \(rounds\)/i);
      await user.type(durationInput, "5");

      // Add condition
      await user.click(screen.getByRole("button", { name: /add condition/i }));

      // Re-open dialog (simulate parent re-rendering with isOpen: true)
      rerender(<AddConditionDialog {...defaultProps} onAdd={onAdd} isOpen={false} />);
      rerender(<AddConditionDialog {...defaultProps} onAdd={onAdd} isOpen={true} />);

      // Form should be reset - Add button should be disabled
      const addButton = screen.getByRole("button", { name: /add condition/i });
      expect(addButton).toBeDisabled();
    });

    it("should reset form after cancelling", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      const { rerender } = render(<AddConditionDialog {...defaultProps} onCancel={onCancel} />);

      // Select condition and duration
      const select = screen.getByRole("combobox");
      await user.click(select);
      await user.click(screen.getByRole("option", { name: /zatruty/i }));

      const durationInput = screen.getByLabelText(/duration \(rounds\)/i);
      await user.type(durationInput, "10");

      // Cancel
      await user.click(screen.getByRole("button", { name: /cancel/i }));

      // Re-open dialog
      rerender(<AddConditionDialog {...defaultProps} onCancel={onCancel} isOpen={false} />);
      rerender(<AddConditionDialog {...defaultProps} onCancel={onCancel} isOpen={true} />);

      // Form should be reset
      const addButton = screen.getByRole("button", { name: /add condition/i });
      expect(addButton).toBeDisabled();
    });
  });

  // ============================================================================
  // Tests: Cancel Behavior
  // ============================================================================

  describe("Cancel Behavior", () => {
    it("should call onCancel when Cancel button clicked", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<AddConditionDialog {...defaultProps} onCancel={onCancel} />);

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should NOT call onAdd when cancelling", async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      const onCancel = vi.fn();
      render(<AddConditionDialog {...defaultProps} onAdd={onAdd} onCancel={onCancel} />);

      // Select condition
      const select = screen.getByRole("combobox");
      await user.click(select);
      await user.click(screen.getByRole("option", { name: /oślepiony/i }));

      // Cancel
      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalled();
      expect(onAdd).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Tests: Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle empty conditions array", async () => {
      const user = userEvent.setup();
      render(<AddConditionDialog {...defaultProps} conditions={[]} />);

      const select = screen.getByRole("combobox");
      await user.click(select);

      // Should show message about all conditions applied (because available = 0)
      expect(screen.getByText(/all conditions already applied/i)).toBeInTheDocument();
    });

    it("should handle single available condition", async () => {
      const user = userEvent.setup();
      const singleCondition = [mockConditions[0]];
      render(<AddConditionDialog {...defaultProps} conditions={singleCondition} />);

      const select = screen.getByRole("combobox");
      await user.click(select);

      expect(screen.getByRole("option", { name: /oślepiony/i })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: /zatruty/i })).not.toBeInTheDocument();
    });

    it("should handle condition with very long description", async () => {
      const user = userEvent.setup();
      const longDescCondition: ConditionDTO = {
        id: "test",
        name: { en: "Test", pl: "Test" },
        description: "A".repeat(500), // Very long description
      };

      render(<AddConditionDialog {...defaultProps} conditions={[longDescCondition]} />);

      const select = screen.getByRole("combobox");
      await user.click(select);
      await user.click(screen.getByRole("option", { name: /test/i }));

      // Should render without crashing
      const preview = screen.getByText((content, element) => {
        return element?.textContent === "A".repeat(500);
      });
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveClass("line-clamp-3"); // Should be truncated
    });

    it("should handle participant name with special characters", () => {
      render(<AddConditionDialog {...defaultProps} participantName="Troll's Minion #1 (Charmed)" />);

      expect(screen.getByText(/add a condition to troll's minion #1 \(charmed\)/i)).toBeInTheDocument();
    });

    it("should convert string duration to number correctly", async () => {
      const user = userEvent.setup();
      const onAdd = vi.fn();
      render(<AddConditionDialog {...defaultProps} onAdd={onAdd} />);

      const select = screen.getByRole("combobox");
      await user.click(select);
      await user.click(screen.getByRole("option", { name: /oślepiony/i }));

      const durationInput = screen.getByLabelText(/duration \(rounds\)/i);
      await user.type(durationInput, "007"); // Leading zeros

      await user.click(screen.getByRole("button", { name: /add condition/i }));

      // parseInt should convert "007" to 7
      expect(onAdd).toHaveBeenCalledWith("blinded", 7);
    });
  });

  // ============================================================================
  // Tests: Accessibility
  // ============================================================================

  describe("Accessibility", () => {
    it("should have proper labels for form fields", () => {
      render(<AddConditionDialog {...defaultProps} />);

      expect(screen.getByLabelText("Condition")).toBeInTheDocument();
      expect(screen.getByLabelText(/duration \(rounds\)/i)).toBeInTheDocument();
    });

    it("should have dialog role", () => {
      render(<AddConditionDialog {...defaultProps} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have accessible button labels", () => {
      render(<AddConditionDialog {...defaultProps} />);

      expect(screen.getByRole("button", { name: /add condition/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });
  });
});
