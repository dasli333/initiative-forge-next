// Unit tests for HPControls - HP management logic
// Tests cover critical HP calculations, validation, and edge cases

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HPControls } from "./HPControls";

// ============================================================================
// Test Setup
// ============================================================================

describe("HPControls", () => {
  const defaultProps = {
    currentHP: 50,
    maxHP: 100,
    onHPChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Tests: Rendering & Initial State
  // ============================================================================

  describe("Rendering", () => {
    it("should render HP display with current and max values", () => {
      render(<HPControls {...defaultProps} />);

      expect(screen.getByText("HP")).toBeInTheDocument();
      expect(screen.getByText("50/100")).toBeInTheDocument();
    });

    it("should render input field with placeholder", () => {
      render(<HPControls {...defaultProps} />);

      const input = screen.getByPlaceholderText("#");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "number");
    });

    it("should render damage and heal buttons", () => {
      render(<HPControls {...defaultProps} />);

      expect(screen.getByRole("button", { name: /dmg/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /heal/i })).toBeInTheDocument();
    });

    it("should have both buttons disabled initially (empty input)", () => {
      render(<HPControls {...defaultProps} />);

      expect(screen.getByRole("button", { name: /dmg/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /heal/i })).toBeDisabled();
    });

    it("should render progress bar", () => {
      render(<HPControls {...defaultProps} />);

      // Progress bar should be rendered
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Tests: HP Percentage Calculation
  // ============================================================================

  describe("HP Percentage Calculation", () => {
    it("should render progress bar when HP is at max", () => {
      render(<HPControls currentHP={100} maxHP={100} onHPChange={vi.fn()} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
      expect(screen.getByText("100/100")).toBeInTheDocument();
    });

    it("should render progress bar when HP is half", () => {
      render(<HPControls currentHP={25} maxHP={50} onHPChange={vi.fn()} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
      expect(screen.getByText("25/50")).toBeInTheDocument();
    });

    it("should render progress bar when HP is 0", () => {
      render(<HPControls currentHP={0} maxHP={100} onHPChange={vi.fn()} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
      expect(screen.getByText("0/100")).toBeInTheDocument();
    });

    it("should handle edge case: maxHP is 0", () => {
      // Should not crash
      render(<HPControls currentHP={0} maxHP={0} onHPChange={vi.fn()} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
      expect(screen.getByText("0/0")).toBeInTheDocument();
    });

    it("should render correctly for non-round numbers", () => {
      // 33 / 99 = 33.33%
      render(<HPControls currentHP={33} maxHP={99} onHPChange={vi.fn()} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
      expect(screen.getByText("33/99")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Tests: Input Validation
  // ============================================================================

  describe("Input Validation", () => {
    it("should show error for negative numbers", async () => {
      const user = userEvent.setup();
      render(<HPControls {...defaultProps} />);

      const input = screen.getByPlaceholderText("#");
      await user.type(input, "-10");

      expect(screen.getByText("Must be a positive number")).toBeInTheDocument();
    });

    it("should show error for zero", async () => {
      const user = userEvent.setup();
      render(<HPControls {...defaultProps} />);

      const input = screen.getByPlaceholderText("#");
      await user.type(input, "0");

      expect(screen.getByText("Must be a positive number")).toBeInTheDocument();
    });

    it("should NOT show error for positive numbers", async () => {
      const user = userEvent.setup();
      render(<HPControls {...defaultProps} />);

      const input = screen.getByPlaceholderText("#");
      await user.type(input, "10");

      expect(screen.queryByText("Must be a positive number")).not.toBeInTheDocument();
    });

    it("should disable buttons when input is invalid", async () => {
      const user = userEvent.setup();
      render(<HPControls {...defaultProps} />);

      const input = screen.getByPlaceholderText("#");
      await user.type(input, "-5");

      expect(screen.getByRole("button", { name: /dmg/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /heal/i })).toBeDisabled();
    });

    it("should enable buttons when input is valid", async () => {
      const user = userEvent.setup();
      render(<HPControls {...defaultProps} />);

      const input = screen.getByPlaceholderText("#");
      await user.type(input, "10");

      expect(screen.getByRole("button", { name: /dmg/i })).toBeEnabled();
      expect(screen.getByRole("button", { name: /heal/i })).toBeEnabled();
    });

    it("should handle non-numeric input", async () => {
      const user = userEvent.setup();
      render(<HPControls {...defaultProps} />);

      const input = screen.getByPlaceholderText("#");
      await user.type(input, "abc");

      // HTML5 number input prevents non-numeric input, but if it gets through:
      expect(screen.getByRole("button", { name: /dmg/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /heal/i })).toBeDisabled();
    });
  });

  // ============================================================================
  // Tests: Damage Logic
  // ============================================================================

  describe("Damage Logic", () => {
    it("should call onHPChange with correct damage values", async () => {
      const user = userEvent.setup();
      const onHPChange = vi.fn();
      render(<HPControls {...defaultProps} onHPChange={onHPChange} />);

      const input = screen.getByPlaceholderText("#");
      await user.type(input, "10");
      await user.click(screen.getByRole("button", { name: /dmg/i }));

      expect(onHPChange).toHaveBeenCalledWith(10, "damage");
    });

    it("should clear input after applying damage", async () => {
      const user = userEvent.setup();
      render(<HPControls {...defaultProps} />);

      const input = screen.getByPlaceholderText("#") as HTMLInputElement;
      await user.type(input, "15");
      await user.click(screen.getByRole("button", { name: /dmg/i }));

      expect(input.value).toBe("");
    });

    it("should clear error after applying damage", async () => {
      const user = userEvent.setup();
      render(<HPControls {...defaultProps} />);

      const input = screen.getByPlaceholderText("#");

      // Create error
      await user.type(input, "-5");
      expect(screen.getByText("Must be a positive number")).toBeInTheDocument();

      // Clear and enter valid value
      await user.clear(input);
      await user.type(input, "10");
      await user.click(screen.getByRole("button", { name: /dmg/i }));

      expect(screen.queryByText("Must be a positive number")).not.toBeInTheDocument();
    });

    it("should handle large damage values", async () => {
      const user = userEvent.setup();
      const onHPChange = vi.fn();
      render(<HPControls {...defaultProps} onHPChange={onHPChange} />);

      const input = screen.getByPlaceholderText("#");
      await user.type(input, "999");
      await user.click(screen.getByRole("button", { name: /dmg/i }));

      expect(onHPChange).toHaveBeenCalledWith(999, "damage");
    });

    it("should not call onHPChange when damage button is disabled", async () => {
      const user = userEvent.setup();
      const onHPChange = vi.fn();
      render(<HPControls {...defaultProps} onHPChange={onHPChange} />);

      // Try to click without entering a value
      const damageButton = screen.getByRole("button", { name: /dmg/i });
      await user.click(damageButton);

      expect(onHPChange).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Tests: Heal Logic
  // ============================================================================

  describe("Heal Logic", () => {
    it("should call onHPChange with correct heal values", async () => {
      const user = userEvent.setup();
      const onHPChange = vi.fn();
      render(<HPControls {...defaultProps} onHPChange={onHPChange} />);

      const input = screen.getByPlaceholderText("#");
      await user.type(input, "20");
      await user.click(screen.getByRole("button", { name: /heal/i }));

      expect(onHPChange).toHaveBeenCalledWith(20, "heal");
    });

    it("should clear input after applying heal", async () => {
      const user = userEvent.setup();
      render(<HPControls {...defaultProps} />);

      const input = screen.getByPlaceholderText("#") as HTMLInputElement;
      await user.type(input, "25");
      await user.click(screen.getByRole("button", { name: /heal/i }));

      expect(input.value).toBe("");
    });

    it("should clear error after applying heal", async () => {
      const user = userEvent.setup();
      render(<HPControls {...defaultProps} />);

      const input = screen.getByPlaceholderText("#");

      // Create error
      await user.type(input, "0");
      expect(screen.getByText("Must be a positive number")).toBeInTheDocument();

      // Clear and enter valid value
      await user.clear(input);
      await user.type(input, "15");
      await user.click(screen.getByRole("button", { name: /heal/i }));

      expect(screen.queryByText("Must be a positive number")).not.toBeInTheDocument();
    });

    it("should handle large heal values", async () => {
      const user = userEvent.setup();
      const onHPChange = vi.fn();
      render(<HPControls {...defaultProps} onHPChange={onHPChange} />);

      const input = screen.getByPlaceholderText("#");
      await user.type(input, "500");
      await user.click(screen.getByRole("button", { name: /heal/i }));

      expect(onHPChange).toHaveBeenCalledWith(500, "heal");
    });

    it("should not call onHPChange when heal button is disabled", async () => {
      const user = userEvent.setup();
      const onHPChange = vi.fn();
      render(<HPControls {...defaultProps} onHPChange={onHPChange} />);

      // Try to click without entering a value
      const healButton = screen.getByRole("button", { name: /heal/i });
      await user.click(healButton);

      expect(onHPChange).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Tests: Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle rapid input changes", async () => {
      const user = userEvent.setup();
      render(<HPControls {...defaultProps} />);

      const input = screen.getByPlaceholderText("#");

      // Rapid typing
      await user.type(input, "1");
      await user.type(input, "0");
      await user.type(input, "5");

      // Should have concatenated value
      expect(input).toHaveValue(105);
    });

    it("should handle switching between valid and invalid input", async () => {
      const user = userEvent.setup();
      render(<HPControls {...defaultProps} />);

      const input = screen.getByPlaceholderText("#");

      // Valid
      await user.type(input, "10");
      expect(screen.queryByText("Must be a positive number")).not.toBeInTheDocument();

      // Clear and make invalid
      await user.clear(input);
      await user.type(input, "-5");
      expect(screen.getByText("Must be a positive number")).toBeInTheDocument();

      // Clear and make valid again
      await user.clear(input);
      await user.type(input, "20");
      expect(screen.queryByText("Must be a positive number")).not.toBeInTheDocument();
    });

    it("should handle decimal numbers", async () => {
      const user = userEvent.setup();
      const onHPChange = vi.fn();
      render(<HPControls {...defaultProps} onHPChange={onHPChange} />);

      const input = screen.getByPlaceholderText("#");
      await user.type(input, "10.5");
      await user.click(screen.getByRole("button", { name: /dmg/i }));

      // parseInt should convert to 10
      expect(onHPChange).toHaveBeenCalledWith(10, "damage");
    });

    it("should display correct HP when currentHP equals maxHP", () => {
      render(<HPControls currentHP={100} maxHP={100} onHPChange={vi.fn()} />);

      expect(screen.getByText("100/100")).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should display correct HP when currentHP is 0", () => {
      render(<HPControls currentHP={0} maxHP={100} onHPChange={vi.fn()} />);

      expect(screen.getByText("0/100")).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should handle very large HP values", () => {
      render(<HPControls currentHP={9999} maxHP={10000} onHPChange={vi.fn()} />);

      expect(screen.getByText("9999/10000")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Tests: User Workflow
  // ============================================================================

  describe("User Workflow", () => {
    it("should support complete damage workflow", async () => {
      const user = userEvent.setup();
      const onHPChange = vi.fn();
      render(<HPControls {...defaultProps} onHPChange={onHPChange} />);

      // User enters damage value
      const input = screen.getByPlaceholderText("#");
      await user.type(input, "15");

      // User clicks damage button
      await user.click(screen.getByRole("button", { name: /dmg/i }));

      // Verify callback
      expect(onHPChange).toHaveBeenCalledWith(15, "damage");
      expect(onHPChange).toHaveBeenCalledTimes(1);

      // Verify input is cleared
      expect(input).toHaveValue(null);
    });

    it("should support complete heal workflow", async () => {
      const user = userEvent.setup();
      const onHPChange = vi.fn();
      render(<HPControls {...defaultProps} onHPChange={onHPChange} />);

      // User enters heal value
      const input = screen.getByPlaceholderText("#");
      await user.type(input, "30");

      // User clicks heal button
      await user.click(screen.getByRole("button", { name: /heal/i }));

      // Verify callback
      expect(onHPChange).toHaveBeenCalledWith(30, "heal");
      expect(onHPChange).toHaveBeenCalledTimes(1);

      // Verify input is cleared
      expect(input).toHaveValue(null);
    });

    it("should support multiple consecutive operations", async () => {
      const user = userEvent.setup();
      const onHPChange = vi.fn();
      render(<HPControls {...defaultProps} onHPChange={onHPChange} />);

      const input = screen.getByPlaceholderText("#");

      // First damage
      await user.type(input, "10");
      await user.click(screen.getByRole("button", { name: /dmg/i }));

      // Second heal
      await user.type(input, "5");
      await user.click(screen.getByRole("button", { name: /heal/i }));

      // Third damage
      await user.type(input, "20");
      await user.click(screen.getByRole("button", { name: /dmg/i }));

      expect(onHPChange).toHaveBeenCalledTimes(3);
      expect(onHPChange).toHaveBeenNthCalledWith(1, 10, "damage");
      expect(onHPChange).toHaveBeenNthCalledWith(2, 5, "heal");
      expect(onHPChange).toHaveBeenNthCalledWith(3, 20, "damage");
    });
  });
});
