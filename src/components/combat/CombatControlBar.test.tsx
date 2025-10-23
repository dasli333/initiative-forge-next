// Unit tests for CombatControlBar component
// Tests cover conditional rendering, button states, handlers, and accessibility

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CombatControlBar } from "./CombatControlBar";
import { useLanguageStore } from "@/stores/languageStore";
import { mockNavigate } from "@/test/mocks/astro-navigation";

// ============================================================================
// Mock Setup
// ============================================================================

// Mock handlers
const mockOnRollInitiative = vi.fn();
const mockOnStartCombat = vi.fn();
const mockOnNextTurn = vi.fn();
const mockOnSave = vi.fn();

// Default props for testing
const defaultProps = {
  currentRound: 1,
  isCombatStarted: false,
  hasParticipants: true,
  allInitiativesSet: true,
  isDirty: false,
  isSaving: false,
  onRollInitiative: mockOnRollInitiative,
  onStartCombat: mockOnStartCombat,
  onNextTurn: mockOnNextTurn,
  onSave: mockOnSave,
  campaignId: "test-campaign-123",
};

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  mockNavigate.mockClear();

  // Reset language store to English
  useLanguageStore.setState({ selectedLanguage: "en" });
});

// ============================================================================
// Tests: Conditional Rendering - Before Combat Starts
// ============================================================================

describe("CombatControlBar - Before Combat Starts", () => {
  it("should render combat control buttons when combat not started", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    expect(screen.getByText("Roll Initiative")).toBeInTheDocument();
    expect(screen.getByText("Start Combat")).toBeInTheDocument();
  });

  it("should render language toggle when combat not started", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    const languageToggle = screen.getByRole("switch", {
      name: /toggle language/i,
    });
    expect(languageToggle).toBeInTheDocument();
  });

  it("should NOT render Back button when combat not started", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    expect(screen.queryByText("Back")).not.toBeInTheDocument();
  });

  it("should NOT render Save button when combat not started", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("should NOT render RoundCounter when combat not started", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    expect(screen.queryByText(/Round:/i)).not.toBeInTheDocument();
  });

  it("should NOT render Next Turn button when combat not started", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    expect(screen.queryByText("Next Turn")).not.toBeInTheDocument();
  });
});

// ============================================================================
// Tests: Conditional Rendering - After Combat Starts
// ============================================================================

describe("CombatControlBar - After Combat Starts", () => {
  it("should render Back and Save buttons when combat started", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} />);

    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("should render RoundCounter when combat started", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} currentRound={5} />);

    expect(screen.getByText(/Round: 5/i)).toBeInTheDocument();
  });

  it("should render Next Turn button when combat started", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} />);

    expect(screen.getByText("Next Turn")).toBeInTheDocument();
  });

  it("should render language toggle when combat started", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} />);

    const languageToggle = screen.getByRole("switch", {
      name: /toggle language/i,
    });
    expect(languageToggle).toBeInTheDocument();
  });

  it("should NOT render Roll Initiative button when combat started", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} />);

    expect(screen.queryByText("Roll Initiative")).not.toBeInTheDocument();
  });

  it("should NOT render Start Combat button when combat started", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} />);

    expect(screen.queryByText("Start Combat")).not.toBeInTheDocument();
  });
});

// ============================================================================
// Tests: Button Disabled States - Start Combat
// ============================================================================

describe("CombatControlBar - Start Combat Button States", () => {
  it("should enable Start Combat when hasParticipants and allInitiativesSet", () => {
    render(
      <CombatControlBar
        {...defaultProps}
        isCombatStarted={false}
        hasParticipants={true}
        allInitiativesSet={true}
      />
    );

    const startButton = screen.getByText("Start Combat");
    expect(startButton).not.toBeDisabled();
  });

  it("should disable Start Combat when no participants", () => {
    render(
      <CombatControlBar
        {...defaultProps}
        isCombatStarted={false}
        hasParticipants={false}
        allInitiativesSet={true}
      />
    );

    const startButton = screen.getByText("Start Combat");
    expect(startButton).toBeDisabled();
  });

  it("should disable Start Combat when initiatives not set", () => {
    render(
      <CombatControlBar
        {...defaultProps}
        isCombatStarted={false}
        hasParticipants={true}
        allInitiativesSet={false}
      />
    );

    const startButton = screen.getByText("Start Combat");
    expect(startButton).toBeDisabled();
  });

  it("should disable Start Combat when no participants AND initiatives not set", () => {
    render(
      <CombatControlBar
        {...defaultProps}
        isCombatStarted={false}
        hasParticipants={false}
        allInitiativesSet={false}
      />
    );

    const startButton = screen.getByText("Start Combat");
    expect(startButton).toBeDisabled();
  });
});

// ============================================================================
// Tests: Button Disabled States - Save
// ============================================================================

describe("CombatControlBar - Save Button States", () => {
  it("should enable Save when isDirty and not saving", () => {
    render(
      <CombatControlBar
        {...defaultProps}
        isCombatStarted={true}
        isDirty={true}
        isSaving={false}
      />
    );

    const saveButton = screen.getByText("Save");
    expect(saveButton).not.toBeDisabled();
  });

  it("should disable Save when not dirty", () => {
    render(
      <CombatControlBar
        {...defaultProps}
        isCombatStarted={true}
        isDirty={false}
        isSaving={false}
      />
    );

    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeDisabled();
  });

  it("should disable Save when currently saving", () => {
    render(
      <CombatControlBar
        {...defaultProps}
        isCombatStarted={true}
        isDirty={true}
        isSaving={true}
      />
    );

    const saveButton = screen.getByText("Saving...");
    expect(saveButton).toBeDisabled();
  });

  it("should disable Save when not dirty AND currently saving", () => {
    render(
      <CombatControlBar
        {...defaultProps}
        isCombatStarted={true}
        isDirty={false}
        isSaving={true}
      />
    );

    const saveButton = screen.getByText("Saving...");
    expect(saveButton).toBeDisabled();
  });

  it("should display 'Saving...' text when isSaving is true", () => {
    render(
      <CombatControlBar {...defaultProps} isCombatStarted={true} isSaving={true} />
    );

    expect(screen.getByText("Saving...")).toBeInTheDocument();
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("should display 'Save' text when isSaving is false", () => {
    render(
      <CombatControlBar {...defaultProps} isCombatStarted={true} isSaving={false} />
    );

    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.queryByText("Saving...")).not.toBeInTheDocument();
  });
});

// ============================================================================
// Tests: Button Click Handlers
// ============================================================================

describe("CombatControlBar - Button Click Handlers", () => {
  it("should call onRollInitiative when Roll Initiative clicked", async () => {
    const user = userEvent.setup();
    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    const rollButton = screen.getByText("Roll Initiative");
    await user.click(rollButton);

    expect(mockOnRollInitiative).toHaveBeenCalledTimes(1);
  });

  it("should call onStartCombat when Start Combat clicked", async () => {
    const user = userEvent.setup();
    render(
      <CombatControlBar
        {...defaultProps}
        isCombatStarted={false}
        hasParticipants={true}
        allInitiativesSet={true}
      />
    );

    const startButton = screen.getByText("Start Combat");
    await user.click(startButton);

    expect(mockOnStartCombat).toHaveBeenCalledTimes(1);
  });

  it("should NOT call onStartCombat when button is disabled", async () => {
    const user = userEvent.setup();
    render(
      <CombatControlBar
        {...defaultProps}
        isCombatStarted={false}
        hasParticipants={false}
        allInitiativesSet={false}
      />
    );

    const startButton = screen.getByText("Start Combat");
    await user.click(startButton);

    expect(mockOnStartCombat).not.toHaveBeenCalled();
  });

  it("should call onSave when Save clicked", async () => {
    const user = userEvent.setup();
    render(
      <CombatControlBar
        {...defaultProps}
        isCombatStarted={true}
        isDirty={true}
        isSaving={false}
      />
    );

    const saveButton = screen.getByText("Save");
    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it("should call onNextTurn when Next Turn clicked", async () => {
    const user = userEvent.setup();
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} />);

    const nextTurnButton = screen.getByText("Next Turn");
    await user.click(nextTurnButton);

    expect(mockOnNextTurn).toHaveBeenCalledTimes(1);
  });

  it("should call navigate when Back clicked", async () => {
    const user = userEvent.setup();
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} />);

    const backButton = screen.getByText("Back");
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/campaigns/test-campaign-123/combats");
  });

  it("should navigate with correct campaignId", async () => {
    const user = userEvent.setup();
    render(
      <CombatControlBar
        {...defaultProps}
        isCombatStarted={true}
        campaignId="different-campaign-456"
      />
    );

    const backButton = screen.getByText("Back");
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/campaigns/different-campaign-456/combats");
  });
});

// ============================================================================
// Tests: Language Toggle Integration
// ============================================================================

describe("CombatControlBar - Language Toggle", () => {
  it("should display 'EN' when English is selected", () => {
    useLanguageStore.setState({ selectedLanguage: "en" });

    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("should display 'PL' when Polish is selected", () => {
    useLanguageStore.setState({ selectedLanguage: "pl" });

    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    expect(screen.getByText("PL")).toBeInTheDocument();
  });

  it("should toggle language when switch is clicked (EN → PL)", async () => {
    const user = userEvent.setup();
    useLanguageStore.setState({ selectedLanguage: "en" });

    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    const languageSwitch = screen.getByRole("switch", { name: /toggle language/i });
    await user.click(languageSwitch);

    // Language store should be updated
    expect(useLanguageStore.getState().selectedLanguage).toBe("pl");
  });

  it("should toggle language when switch is clicked (PL → EN)", async () => {
    const user = userEvent.setup();
    useLanguageStore.setState({ selectedLanguage: "pl" });

    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    const languageSwitch = screen.getByRole("switch", { name: /toggle language/i });
    await user.click(languageSwitch);

    expect(useLanguageStore.getState().selectedLanguage).toBe("en");
  });

  it("should have switch checked when Polish is selected", () => {
    useLanguageStore.setState({ selectedLanguage: "pl" });

    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    const languageSwitch = screen.getByRole("switch", { name: /toggle language/i });
    expect(languageSwitch).toBeChecked();
  });

  it("should have switch unchecked when English is selected", () => {
    useLanguageStore.setState({ selectedLanguage: "en" });

    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    const languageSwitch = screen.getByRole("switch", { name: /toggle language/i });
    expect(languageSwitch).not.toBeChecked();
  });
});

// ============================================================================
// Tests: RoundCounter Integration
// ============================================================================

describe("CombatControlBar - RoundCounter Integration", () => {
  it("should display correct round number", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} currentRound={5} />);

    expect(screen.getByText(/Round: 5/i)).toBeInTheDocument();
  });

  it("should display round 1 when combat just started", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} currentRound={1} />);

    expect(screen.getByText(/Round: 1/i)).toBeInTheDocument();
  });

  it("should display large round numbers", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} currentRound={100} />);

    expect(screen.getByText(/Round: 100/i)).toBeInTheDocument();
  });

  it("should update round number when prop changes", () => {
    const { rerender } = render(
      <CombatControlBar {...defaultProps} isCombatStarted={true} currentRound={1} />
    );

    expect(screen.getByText(/Round: 1/i)).toBeInTheDocument();

    rerender(<CombatControlBar {...defaultProps} isCombatStarted={true} currentRound={2} />);

    expect(screen.getByText(/Round: 2/i)).toBeInTheDocument();
  });
});

// ============================================================================
// Tests: Accessibility
// ============================================================================

describe("CombatControlBar - Accessibility", () => {
  it("should have accessible button labels", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    expect(screen.getByRole("button", { name: /roll initiative/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start combat/i })).toBeInTheDocument();
  });

  it("should have accessible switch with aria-label", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    const languageSwitch = screen.getByRole("switch", {
      name: /toggle language between english and polish/i,
    });
    expect(languageSwitch).toBeInTheDocument();
  });

  it("should associate label with switch using htmlFor", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    const label = screen.getByText("EN");
    const switchElement = screen.getByRole("switch");

    expect(label).toHaveAttribute("for", "combat-language-switch");
    expect(switchElement).toHaveAttribute("id", "combat-language-switch");
  });

  it("should have visible keyboard hint on Next Turn button", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} />);

    expect(screen.getByText("(Space)")).toBeInTheDocument();
  });

  it("should render buttons with appropriate disabled state for screen readers", () => {
    render(
      <CombatControlBar
        {...defaultProps}
        isCombatStarted={false}
        hasParticipants={false}
        allInitiativesSet={false}
      />
    );

    const startButton = screen.getByText("Start Combat");
    expect(startButton).toHaveAttribute("disabled");
  });
});

// ============================================================================
// Tests: Component Structure
// ============================================================================

describe("CombatControlBar - Component Structure", () => {
  it("should render within a container div", () => {
    const { container } = render(<CombatControlBar {...defaultProps} />);

    const mainDiv = container.querySelector("div.p-4.border-b.border-border.space-y-4");
    expect(mainDiv).toBeInTheDocument();
  });

  it("should render single row layout before combat starts", () => {
    const { container } = render(
      <CombatControlBar {...defaultProps} isCombatStarted={false} />
    );

    const rows = container.querySelectorAll(".flex.items-center.justify-between");
    expect(rows).toHaveLength(1);
  });

  it("should render two-row layout after combat starts", () => {
    const { container } = render(
      <CombatControlBar {...defaultProps} isCombatStarted={true} />
    );

    // Row 1: Back, Save, Language
    // Row 2: Round Counter, Next Turn
    const rows = container.querySelectorAll(".flex.items-center");
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================================
// Tests: Edge Cases
// ============================================================================

describe("CombatControlBar - Edge Cases", () => {
  it("should handle empty campaignId", async () => {
    const user = userEvent.setup();
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} campaignId="" />);

    const backButton = screen.getByText("Back");
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/campaigns//combats");
  });

  it("should handle round 0", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} currentRound={0} />);

    expect(screen.getByText(/Round: 0/i)).toBeInTheDocument();
  });

  it("should handle negative round number", () => {
    render(<CombatControlBar {...defaultProps} isCombatStarted={true} currentRound={-5} />);

    expect(screen.getByText(/Round: -5/i)).toBeInTheDocument();
  });

  it("should render correctly when all booleans are false", () => {
    render(
      <CombatControlBar
        {...defaultProps}
        isCombatStarted={false}
        hasParticipants={false}
        allInitiativesSet={false}
        isDirty={false}
        isSaving={false}
      />
    );

    // Should still render without errors
    expect(screen.getByText("Roll Initiative")).toBeInTheDocument();
    expect(screen.getByText("Start Combat")).toBeDisabled();
  });

  it("should handle multiple rapid button clicks", async () => {
    const user = userEvent.setup();
    render(<CombatControlBar {...defaultProps} isCombatStarted={false} />);

    const rollButton = screen.getByText("Roll Initiative");

    await user.click(rollButton);
    await user.click(rollButton);
    await user.click(rollButton);

    expect(mockOnRollInitiative).toHaveBeenCalledTimes(3);
  });
});
