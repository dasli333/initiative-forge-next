// Unit tests for RoundCounter component
// Tests cover rendering, props handling, and accessibility

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoundCounter } from "./RoundCounter";

// ============================================================================
// Tests: Basic Rendering
// ============================================================================

describe("RoundCounter - Basic Rendering", () => {
  it("should render the round number correctly", () => {
    render(<RoundCounter round={5} />);

    expect(screen.getByText(/Round: 5/i)).toBeInTheDocument();
  });

  it("should render round 1", () => {
    render(<RoundCounter round={1} />);

    expect(screen.getByText(/Round: 1/i)).toBeInTheDocument();
  });

  it("should render round 10", () => {
    render(<RoundCounter round={10} />);

    expect(screen.getByText(/Round: 10/i)).toBeInTheDocument();
  });

  it("should render round 100", () => {
    render(<RoundCounter round={100} />);

    expect(screen.getByText(/Round: 100/i)).toBeInTheDocument();
  });

  it("should render round 999", () => {
    render(<RoundCounter round={999} />);

    expect(screen.getByText(/Round: 999/i)).toBeInTheDocument();
  });
});

// ============================================================================
// Tests: Edge Cases
// ============================================================================

describe("RoundCounter - Edge Cases", () => {
  it("should handle round 0", () => {
    render(<RoundCounter round={0} />);

    expect(screen.getByText(/Round: 0/i)).toBeInTheDocument();
  });

  it("should handle negative round numbers", () => {
    render(<RoundCounter round={-5} />);

    // Component should still render, even with invalid input
    expect(screen.getByText(/Round: -5/i)).toBeInTheDocument();
  });

  it("should handle very large round numbers", () => {
    render(<RoundCounter round={9999999} />);

    expect(screen.getByText(/Round: 9999999/i)).toBeInTheDocument();
  });

  it("should handle decimal round numbers (TypeScript should prevent, but test runtime)", () => {
    render(<RoundCounter round={5.5 as number} />);

    // Should render the decimal as-is
    expect(screen.getByText(/Round: 5.5/i)).toBeInTheDocument();
  });
});

// ============================================================================
// Tests: DOM Structure
// ============================================================================

describe("RoundCounter - DOM Structure", () => {
  it("should render a div container", () => {
    const { container } = render(<RoundCounter round={5} />);

    const divElement = container.querySelector("div");
    expect(divElement).toBeInTheDocument();
  });

  it("should have text-center class", () => {
    const { container } = render(<RoundCounter round={5} />);

    const divElement = container.querySelector("div");
    expect(divElement).toHaveClass("text-center");
  });

  it("should render a paragraph element", () => {
    render(<RoundCounter round={5} />);

    const paragraph = screen.getByText(/Round: 5/i);
    expect(paragraph.tagName).toBe("P");
  });

  it("should have correct paragraph classes", () => {
    render(<RoundCounter round={5} />);

    const paragraph = screen.getByText(/Round: 5/i);
    expect(paragraph).toHaveClass("text-xl");
    expect(paragraph).toHaveClass("font-bold");
  });
});

// ============================================================================
// Tests: Prop Changes
// ============================================================================

describe("RoundCounter - Prop Changes", () => {
  it("should update when round prop changes", () => {
    const { rerender } = render(<RoundCounter round={1} />);

    expect(screen.getByText(/Round: 1/i)).toBeInTheDocument();

    // Update prop
    rerender(<RoundCounter round={2} />);

    expect(screen.getByText(/Round: 2/i)).toBeInTheDocument();
    expect(screen.queryByText(/Round: 1/i)).not.toBeInTheDocument();
  });

  it("should handle multiple rapid prop updates", () => {
    const { rerender } = render(<RoundCounter round={1} />);

    for (let i = 2; i <= 10; i++) {
      rerender(<RoundCounter round={i} />);
      expect(screen.getByText(new RegExp(`Round: ${i}`, "i"))).toBeInTheDocument();
    }
  });

  it("should handle prop update from high to low value", () => {
    const { rerender } = render(<RoundCounter round={100} />);

    expect(screen.getByText(/Round: 100/i)).toBeInTheDocument();

    rerender(<RoundCounter round={1} />);

    expect(screen.getByText(/Round: 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Round: 100/i)).not.toBeInTheDocument();
  });
});

// ============================================================================
// Tests: Accessibility
// ============================================================================

describe("RoundCounter - Accessibility", () => {
  it("should render text content that is readable", () => {
    render(<RoundCounter round={5} />);

    const text = screen.getByText(/Round: 5/i);

    // Verify text is visible (not hidden)
    expect(text).toBeVisible();
  });

  it("should render semantic HTML", () => {
    const { container } = render(<RoundCounter round={5} />);

    // Should use proper semantic elements (div > p)
    const divElement = container.querySelector("div");
    const paragraph = divElement?.querySelector("p");

    expect(divElement).toBeInTheDocument();
    expect(paragraph).toBeInTheDocument();
  });

  it("should have readable text for screen readers", () => {
    render(<RoundCounter round={5} />);

    // The text "Round: 5" should be accessible to screen readers
    const text = screen.getByText(/Round: 5/i);
    expect(text.textContent).toBe("Round: 5");
  });

  it("should be visible with sufficient font size", () => {
    render(<RoundCounter round={5} />);

    const paragraph = screen.getByText(/Round: 5/i);

    // text-xl class ensures readable font size
    expect(paragraph).toHaveClass("text-xl");
  });

  it("should have sufficient font weight for visibility", () => {
    render(<RoundCounter round={5} />);

    const paragraph = screen.getByText(/Round: 5/i);

    // font-bold class ensures sufficient weight
    expect(paragraph).toHaveClass("font-bold");
  });
});

// ============================================================================
// Tests: Component Isolation
// ============================================================================

describe("RoundCounter - Component Isolation", () => {
  it("should not have side effects on rendering", () => {
    const { unmount } = render(<RoundCounter round={5} />);

    // Should render without errors
    expect(screen.getByText(/Round: 5/i)).toBeInTheDocument();

    // Should unmount without errors
    unmount();

    // Text should no longer be in document
    expect(screen.queryByText(/Round: 5/i)).not.toBeInTheDocument();
  });

  it("should be a pure component (same props = same output)", () => {
    const { container: container1 } = render(<RoundCounter round={5} />);
    const html1 = container1.innerHTML;

    // Unmount and re-render
    const { container: container2 } = render(<RoundCounter round={5} />);
    const html2 = container2.innerHTML;

    // Should produce identical HTML
    expect(html1).toBe(html2);
  });

  it("should render independently when mounted multiple times", () => {
    const { container: container1 } = render(<RoundCounter round={5} />);
    const { container: container2 } = render(<RoundCounter round={10} />);

    // Both should exist in the document
    expect(container1.textContent).toContain("Round: 5");
    expect(container2.textContent).toContain("Round: 10");
  });
});

// ============================================================================
// Tests: TypeScript Type Checking (Runtime Verification)
// ============================================================================

describe("RoundCounter - Type Safety", () => {
  it("should accept number type for round prop", () => {
    const roundValue: number = 5;

    render(<RoundCounter round={roundValue} />);

    expect(screen.getByText(/Round: 5/i)).toBeInTheDocument();
  });

  it("should work with computed number values", () => {
    const currentRound = 3 + 2;

    render(<RoundCounter round={currentRound} />);

    expect(screen.getByText(/Round: 5/i)).toBeInTheDocument();
  });

  it("should work with number constants", () => {
    const INITIAL_ROUND = 1;

    render(<RoundCounter round={INITIAL_ROUND} />);

    expect(screen.getByText(/Round: 1/i)).toBeInTheDocument();
  });
});
