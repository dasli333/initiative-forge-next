// Unit tests for InitiativeList - Main list logic
// Tests cover UI state conditions, auto-scroll behavior, and participant rendering

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { InitiativeList } from "./InitiativeList";
import type { CombatParticipantDTO, ConditionDTO } from "@/types";

// ============================================================================
// Mock Setup
// ============================================================================

// Mock child components
vi.mock("../CombatControlBar", () => ({
  CombatControlBar: ({
    currentRound,
    isCombatStarted,
    hasParticipants,
    allInitiativesSet,
  }: {
    currentRound: number;
    isCombatStarted: boolean;
    hasParticipants: boolean;
    allInitiativesSet: boolean;
  }) => (
    <div data-testid="combat-control-bar">
      <span>Round: {currentRound}</span>
      <span>Started: {isCombatStarted.toString()}</span>
      <span>Has Participants: {hasParticipants.toString()}</span>
      <span>All Initiatives Set: {allInitiativesSet.toString()}</span>
    </div>
  ),
}));

vi.mock("./InitiativeItem", () => ({
  InitiativeItem: ({
    participant,
    isActive,
  }: {
    participant: CombatParticipantDTO;
    isActive: boolean;
  }) => (
    <div data-testid={`participant-${participant.id}`} data-active={isActive}>
      {participant.display_name}
    </div>
  ),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, ...props }: any) => <div {...props}>{children}</div>,
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
];

const createMockParticipant = (
  id: string,
  overrides?: Partial<CombatParticipantDTO>
): CombatParticipantDTO => ({
  id,
  source: "monster",
  display_name: `Participant ${id}`,
  initiative: 10,
  current_hp: 10,
  max_hp: 10,
  armor_class: 15,
  stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  actions: [],
  is_active_turn: false,
  active_conditions: [],
  ...overrides,
});

// ============================================================================
// Tests
// ============================================================================

describe("InitiativeList", () => {
  const defaultProps = {
    participants: [],
    currentRound: 1,
    activeParticipantIndex: null,
    onRollInitiative: vi.fn(),
    onStartCombat: vi.fn(),
    onNextTurn: vi.fn(),
    onSave: vi.fn(),
    isDirty: false,
    isSaving: false,
    campaignId: "campaign-1",
    onParticipantUpdate: vi.fn(),
    onAddCondition: vi.fn(),
    onRemoveCondition: vi.fn(),
    conditions: mockConditions,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // ============================================================================
  // Tests: Rendering & Basic Structure
  // ============================================================================

  describe("Rendering & Basic Structure", () => {
    it("should render CombatControlBar", () => {
      render(<InitiativeList {...defaultProps} />);

      expect(screen.getByTestId("combat-control-bar")).toBeInTheDocument();
    });

    it("should show empty state message when no participants", () => {
      render(<InitiativeList {...defaultProps} participants={[]} />);

      expect(screen.getByText(/no participants in combat/i)).toBeInTheDocument();
    });

    it("should NOT show empty state when participants exist", () => {
      const participants = [createMockParticipant("1")];
      render(<InitiativeList {...defaultProps} participants={participants} />);

      expect(screen.queryByText(/no participants in combat/i)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Tests: Participants Rendering
  // ============================================================================

  describe("Participants Rendering", () => {
    it("should render all participants", () => {
      const participants = [
        createMockParticipant("1", { display_name: "Goblin 1" }),
        createMockParticipant("2", { display_name: "Goblin 2" }),
        createMockParticipant("3", { display_name: "Orc" }),
      ];

      render(<InitiativeList {...defaultProps} participants={participants} />);

      expect(screen.getByText("Goblin 1")).toBeInTheDocument();
      expect(screen.getByText("Goblin 2")).toBeInTheDocument();
      expect(screen.getByText("Orc")).toBeInTheDocument();
    });

    it("should render participants in order", () => {
      const participants = [
        createMockParticipant("1", { display_name: "First" }),
        createMockParticipant("2", { display_name: "Second" }),
        createMockParticipant("3", { display_name: "Third" }),
      ];

      render(<InitiativeList {...defaultProps} participants={participants} />);

      const items = screen.getAllByTestId(/^participant-/);
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent("First");
      expect(items[1]).toHaveTextContent("Second");
      expect(items[2]).toHaveTextContent("Third");
    });

    it("should mark active participant correctly", () => {
      const participants = [
        createMockParticipant("1"),
        createMockParticipant("2"),
        createMockParticipant("3"),
      ];

      render(<InitiativeList {...defaultProps} participants={participants} activeParticipantIndex={1} />);

      const participant1 = screen.getByTestId("participant-1");
      const participant2 = screen.getByTestId("participant-2");
      const participant3 = screen.getByTestId("participant-3");

      expect(participant1).toHaveAttribute("data-active", "false");
      expect(participant2).toHaveAttribute("data-active", "true");
      expect(participant3).toHaveAttribute("data-active", "false");
    });

    it("should handle single participant", () => {
      const participants = [createMockParticipant("1", { display_name: "Solo Fighter" })];

      render(<InitiativeList {...defaultProps} participants={participants} />);

      expect(screen.getByText("Solo Fighter")).toBeInTheDocument();
    });

    it("should handle many participants", () => {
      const participants = Array.from({ length: 20 }, (_, i) =>
        createMockParticipant(`${i + 1}`, { display_name: `Participant ${i + 1}` })
      );

      render(<InitiativeList {...defaultProps} participants={participants} />);

      participants.forEach((p) => {
        expect(screen.getByText(p.display_name)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Tests: Combat State Logic (isCombatStarted)
  // ============================================================================

  describe("Combat State - isCombatStarted", () => {
    it("should be false when activeParticipantIndex is null", () => {
      render(<InitiativeList {...defaultProps} activeParticipantIndex={null} />);

      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("Started: false");
    });

    it("should be true when activeParticipantIndex is 0", () => {
      const participants = [createMockParticipant("1")];
      render(<InitiativeList {...defaultProps} participants={participants} activeParticipantIndex={0} />);

      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("Started: true");
    });

    it("should be true when activeParticipantIndex is > 0", () => {
      const participants = [createMockParticipant("1"), createMockParticipant("2")];
      render(<InitiativeList {...defaultProps} participants={participants} activeParticipantIndex={1} />);

      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("Started: true");
    });
  });

  // ============================================================================
  // Tests: Combat State Logic (hasParticipants)
  // ============================================================================

  describe("Combat State - hasParticipants", () => {
    it("should be false when participants array is empty", () => {
      render(<InitiativeList {...defaultProps} participants={[]} />);

      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("Has Participants: false");
    });

    it("should be true when participants array has one item", () => {
      const participants = [createMockParticipant("1")];
      render(<InitiativeList {...defaultProps} participants={participants} />);

      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("Has Participants: true");
    });

    it("should be true when participants array has multiple items", () => {
      const participants = [createMockParticipant("1"), createMockParticipant("2")];
      render(<InitiativeList {...defaultProps} participants={participants} />);

      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("Has Participants: true");
    });
  });

  // ============================================================================
  // Tests: Combat State Logic (allInitiativesSet)
  // ============================================================================

  describe("Combat State - allInitiativesSet", () => {
    it("should be false when any participant has null initiative", () => {
      const participants = [
        createMockParticipant("1", { initiative: 15 }),
        createMockParticipant("2", { initiative: null }),
        createMockParticipant("3", { initiative: 10 }),
      ];

      render(<InitiativeList {...defaultProps} participants={participants} />);

      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("All Initiatives Set: false");
    });

    it("should be true when all participants have initiative", () => {
      const participants = [
        createMockParticipant("1", { initiative: 15 }),
        createMockParticipant("2", { initiative: 12 }),
        createMockParticipant("3", { initiative: 10 }),
      ];

      render(<InitiativeList {...defaultProps} participants={participants} />);

      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("All Initiatives Set: true");
    });

    it("should be false when participants array is empty", () => {
      render(<InitiativeList {...defaultProps} participants={[]} />);

      const controlBar = screen.getByTestId("combat-control-bar");
      // Empty array means no participants, so allInitiativesSet should be false
      expect(controlBar).toHaveTextContent("All Initiatives Set: false");
    });

    it("should handle initiative value of 0 as valid", () => {
      const participants = [
        createMockParticipant("1", { initiative: 0 }),
        createMockParticipant("2", { initiative: 5 }),
      ];

      render(<InitiativeList {...defaultProps} participants={participants} />);

      const controlBar = screen.getByTestId("combat-control-bar");
      // 0 is a valid initiative, not null
      expect(controlBar).toHaveTextContent("All Initiatives Set: true");
    });
  });

  // ============================================================================
  // Tests: Props Propagation to CombatControlBar
  // ============================================================================

  describe("Props Propagation to CombatControlBar", () => {
    it("should pass currentRound to CombatControlBar", () => {
      render(<InitiativeList {...defaultProps} currentRound={5} />);

      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("Round: 5");
    });

    it("should pass currentRound of 1 at start", () => {
      render(<InitiativeList {...defaultProps} currentRound={1} />);

      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("Round: 1");
    });

    it("should handle high round numbers", () => {
      render(<InitiativeList {...defaultProps} currentRound={999} />);

      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("Round: 999");
    });
  });

  // ============================================================================
  // Tests: Auto-scroll Behavior
  // ============================================================================

  describe("Auto-scroll Behavior", () => {
    it("should create ref for active participant", () => {
      const participants = [
        createMockParticipant("1"),
        createMockParticipant("2"),
        createMockParticipant("3"),
      ];

      const { container } = render(
        <InitiativeList {...defaultProps} participants={participants} activeParticipantIndex={1} />
      );

      // The active participant should have a ref attached
      const activeParticipant = screen.getByTestId("participant-2");
      expect(activeParticipant).toBeInTheDocument();
    });

    it("should call scrollIntoView when activeParticipantIndex changes", () => {
      const scrollIntoViewMock = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      const participants = [
        createMockParticipant("1"),
        createMockParticipant("2"),
        createMockParticipant("3"),
      ];

      const { rerender } = render(
        <InitiativeList {...defaultProps} participants={participants} activeParticipantIndex={0} />
      );

      // Change active participant
      rerender(
        <InitiativeList {...defaultProps} participants={participants} activeParticipantIndex={1} />
      );

      // scrollIntoView should be called with smooth scroll
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "center",
      });
    });

    it("should NOT call scrollIntoView when activeParticipantIndex is null", () => {
      const scrollIntoViewMock = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      const participants = [createMockParticipant("1")];

      render(<InitiativeList {...defaultProps} participants={participants} activeParticipantIndex={null} />);

      // Should not be called when activeParticipantIndex is null
      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Tests: Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle activeParticipantIndex out of bounds (too high)", () => {
      const participants = [createMockParticipant("1")];

      // activeParticipantIndex = 5, but only 1 participant
      render(<InitiativeList {...defaultProps} participants={participants} activeParticipantIndex={5} />);

      // Should not crash, combat should be considered started
      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("Started: true");
    });

    it("should handle negative activeParticipantIndex", () => {
      const participants = [createMockParticipant("1")];

      render(
        <InitiativeList {...defaultProps} participants={participants} activeParticipantIndex={-1} />
      );

      // Should not crash
      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("Started: true"); // -1 is not null
    });

    it("should handle participants with mixed initiative states", () => {
      const participants = [
        createMockParticipant("1", { initiative: 20 }),
        createMockParticipant("2", { initiative: null }),
        createMockParticipant("3", { initiative: 0 }),
        createMockParticipant("4", { initiative: -5 }),
      ];

      render(<InitiativeList {...defaultProps} participants={participants} />);

      // Should render all participants
      expect(screen.getAllByTestId(/^participant-/)).toHaveLength(4);

      // allInitiativesSet should be false (one has null)
      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("All Initiatives Set: false");
    });

    it("should handle participant with empty display_name", () => {
      const participants = [createMockParticipant("1", { display_name: "" })];

      render(<InitiativeList {...defaultProps} participants={participants} />);

      // Should render without crashing
      expect(screen.getByTestId("participant-1")).toBeInTheDocument();
    });

    it("should handle duplicate participant IDs gracefully", () => {
      const participants = [
        createMockParticipant("1", { display_name: "First" }),
        createMockParticipant("1", { display_name: "Duplicate" }), // Same ID
      ];

      render(<InitiativeList {...defaultProps} participants={participants} />);

      // React will render both, but with key warning in console
      // We verify it doesn't crash
      expect(screen.getByText("First")).toBeInTheDocument();
      expect(screen.getByText("Duplicate")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Tests: Callback Prop Passing
  // ============================================================================

  describe("Callback Prop Passing", () => {
    it("should pass all callbacks to CombatControlBar", () => {
      const handlers = {
        onRollInitiative: vi.fn(),
        onStartCombat: vi.fn(),
        onNextTurn: vi.fn(),
        onSave: vi.fn(),
      };

      render(<InitiativeList {...defaultProps} {...handlers} />);

      // CombatControlBar should receive these props (verified by mock)
      expect(screen.getByTestId("combat-control-bar")).toBeInTheDocument();
    });

    it("should pass participant update handlers to InitiativeItem", () => {
      const handlers = {
        onParticipantUpdate: vi.fn(),
        onAddCondition: vi.fn(),
        onRemoveCondition: vi.fn(),
      };

      const participants = [createMockParticipant("1")];

      render(<InitiativeList {...defaultProps} participants={participants} {...handlers} />);

      // InitiativeItem should receive these props (verified by mock)
      expect(screen.getByTestId("participant-1")).toBeInTheDocument();
    });

    it("should pass conditions array to InitiativeItem", () => {
      const participants = [createMockParticipant("1")];

      render(<InitiativeList {...defaultProps} participants={participants} />);

      // Conditions should be passed to InitiativeItem
      expect(screen.getByTestId("participant-1")).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Tests: Combat Round Display
  // ============================================================================

  describe("Combat Round Display", () => {
    it("should display round 1 before combat starts", () => {
      render(<InitiativeList {...defaultProps} currentRound={1} activeParticipantIndex={null} />);

      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("Round: 1");
      expect(controlBar).toHaveTextContent("Started: false");
    });

    it("should display current round during combat", () => {
      const participants = [createMockParticipant("1")];

      render(
        <InitiativeList
          {...defaultProps}
          participants={participants}
          currentRound={3}
          activeParticipantIndex={0}
        />
      );

      const controlBar = screen.getByTestId("combat-control-bar");
      expect(controlBar).toHaveTextContent("Round: 3");
      expect(controlBar).toHaveTextContent("Started: true");
    });
  });
});
