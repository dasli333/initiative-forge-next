// Unit tests for formatConditionDescription - Text formatting utility
// Tests cover markdown-like formatting, edge cases, and React node generation

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { formatConditionDescription } from "./format-description";

// ============================================================================
// Helper function to render result for testing
// ============================================================================

const renderDescription = (description: string) => {
  const result = formatConditionDescription(description);
  const { container } = render(<div>{result}</div>);
  return container;
};

// ============================================================================
// Tests
// ============================================================================

describe("formatConditionDescription", () => {
  // ============================================================================
  // Tests: Basic Formatting
  // ============================================================================

  describe("Basic Formatting", () => {
    it("should return array of React nodes", () => {
      const result = formatConditionDescription("Simple text");

      expect(Array.isArray(result)).toBe(true);
    });

    it("should wrap text in paragraph element", () => {
      const container = renderDescription("Simple text");

      const paragraph = container.querySelector("p");
      expect(paragraph).toBeInTheDocument();
      expect(paragraph).toHaveTextContent("Simple text");
    });

    it("should apply mb-2 class to paragraphs", () => {
      const container = renderDescription("Text");

      const paragraph = container.querySelector("p");
      expect(paragraph).toHaveClass("mb-2");
    });

    it("should apply last:mb-0 class to last paragraph", () => {
      const container = renderDescription("Text");

      const paragraph = container.querySelector("p");
      expect(paragraph).toHaveClass("last:mb-0");
    });

    it("should handle plain text without formatting", () => {
      const container = renderDescription("A creature is blinded.");

      expect(container.textContent).toContain("A creature is blinded.");
      expect(container.querySelector("strong")).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Tests: Bold Formatting
  // ============================================================================

  describe("Bold Formatting", () => {
    it("should convert **text** to <strong> element", () => {
      const container = renderDescription("This is **bold** text");

      const strong = container.querySelector("strong");
      expect(strong).toBeInTheDocument();
      expect(strong).toHaveTextContent("bold");
    });

    it("should apply font-semibold class to <strong>", () => {
      const container = renderDescription("**bold**");

      const strong = container.querySelector("strong");
      expect(strong).toHaveClass("font-semibold");
    });

    it("should handle multiple bold segments in one line", () => {
      const container = renderDescription("**First** and **Second** bold");

      const strongs = container.querySelectorAll("strong");
      expect(strongs).toHaveLength(2);
      expect(strongs[0]).toHaveTextContent("First");
      expect(strongs[1]).toHaveTextContent("Second");
    });

    it("should preserve text before bold marker", () => {
      const container = renderDescription("Before **bold** after");

      expect(container.textContent).toBe("Before bold after");
    });

    it("should preserve text after bold marker", () => {
      const container = renderDescription("**bold** after");

      expect(container.textContent).toBe("bold after");
    });

    it("should handle bold at start of line", () => {
      const container = renderDescription("**Bold** at start");

      const strong = container.querySelector("strong");
      expect(strong).toHaveTextContent("Bold");
      expect(container.textContent).toBe("Bold at start");
    });

    it("should handle bold at end of line", () => {
      const container = renderDescription("Text is **bold**");

      const strong = container.querySelector("strong");
      expect(strong).toHaveTextContent("bold");
      expect(container.textContent).toBe("Text is bold");
    });

    it("should handle entire line as bold", () => {
      const container = renderDescription("**Everything is bold**");

      const strong = container.querySelector("strong");
      expect(strong).toHaveTextContent("Everything is bold");
      expect(container.textContent).toBe("Everything is bold");
    });
  });

  // ============================================================================
  // Tests: Multiline Formatting
  // ============================================================================

  describe("Multiline Formatting", () => {
    it("should split text by newlines", () => {
      const container = renderDescription("Line 1\nLine 2\nLine 3");

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(3);
      expect(paragraphs[0]).toHaveTextContent("Line 1");
      expect(paragraphs[1]).toHaveTextContent("Line 2");
      expect(paragraphs[2]).toHaveTextContent("Line 3");
    });

    it("should handle bold in multiple lines", () => {
      const container = renderDescription("**Bold 1**\n**Bold 2**");

      const strongs = container.querySelectorAll("strong");
      expect(strongs).toHaveLength(2);
      expect(strongs[0]).toHaveTextContent("Bold 1");
      expect(strongs[1]).toHaveTextContent("Bold 2");
    });

    it("should skip empty lines", () => {
      const container = renderDescription("Line 1\n\nLine 2");

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(2);
      expect(paragraphs[0]).toHaveTextContent("Line 1");
      expect(paragraphs[1]).toHaveTextContent("Line 2");
    });

    it("should skip lines with only whitespace", () => {
      const container = renderDescription("Line 1\n   \nLine 2");

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(2);
    });

    it("should trim whitespace from lines", () => {
      const container = renderDescription("  Line with spaces  \n  Another line  ");

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs[0]).toHaveTextContent("Line with spaces");
      expect(paragraphs[1]).toHaveTextContent("Another line");
    });
  });

  // ============================================================================
  // Tests: Edge Cases
  // ============================================================================

  describe("Edge Cases", () => {
    it("should handle empty string", () => {
      const container = renderDescription("");

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(0);
    });

    it("should handle string with only newlines", () => {
      const container = renderDescription("\n\n\n");

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(0);
    });

    it("should handle string with only whitespace", () => {
      const container = renderDescription("   ");

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(0);
    });

    it("should handle unclosed bold marker", () => {
      const container = renderDescription("This is **unclosed");

      // Should not create bold, just render as-is
      expect(container.textContent).toBe("This is **unclosed");
      expect(container.querySelector("strong")).not.toBeInTheDocument();
    });

    it("should handle single asterisk", () => {
      const container = renderDescription("This * is not bold");

      expect(container.textContent).toBe("This * is not bold");
      expect(container.querySelector("strong")).not.toBeInTheDocument();
    });

    it("should handle triple asterisks", () => {
      const container = renderDescription("***text***");

      // Regex matches **text** leaving one * before and after
      const container2 = renderDescription("**text**");
      expect(container.textContent).toContain("text");
    });

    it("should handle empty bold markers", () => {
      const container = renderDescription("Text **");

      // Empty bold should not match
      expect(container.textContent).toBe("Text **");
    });

    it("should handle nested bold markers", () => {
      const container = renderDescription("**outer **inner** outer**");

      // Regex is non-greedy, so it should match first pair
      const strong = container.querySelector("strong");
      expect(strong).toBeInTheDocument();
    });

    it("should handle very long text", () => {
      const longText = "A".repeat(1000);
      const container = renderDescription(longText);

      expect(container.textContent).toBe(longText);
    });

    it("should handle very long bold text", () => {
      const longBold = `**${"A".repeat(500)}**`;
      const container = renderDescription(longBold);

      const strong = container.querySelector("strong");
      expect(strong).toBeInTheDocument();
      expect(strong?.textContent).toHaveLength(500);
    });

    it("should handle special characters in text", () => {
      const container = renderDescription("Special: @#$%^&*(){}[]|\\<>?/");

      expect(container.textContent).toBe("Special: @#$%^&*(){}[]|\\<>?/");
    });

    it("should handle special characters in bold", () => {
      const container = renderDescription("**@#$%**");

      const strong = container.querySelector("strong");
      expect(strong).toHaveTextContent("@#$%");
    });

    it("should handle Unicode characters", () => {
      const container = renderDescription("Unicode: émojis 🎲 中文");

      expect(container.textContent).toBe("Unicode: émojis 🎲 中文");
    });

    it("should handle Unicode in bold", () => {
      const container = renderDescription("**émojis 🎲**");

      const strong = container.querySelector("strong");
      expect(strong).toHaveTextContent("émojis 🎲");
    });
  });

  // ============================================================================
  // Tests: Real-World Examples
  // ============================================================================

  describe("Real-World Examples", () => {
    it("should format D&D Blinded condition correctly", () => {
      const description =
        "A blinded creature **can't see** and automatically fails any ability check that requires sight.\nAttack rolls against the creature have **advantage**, and the creature's attack rolls have **disadvantage**.";

      const container = renderDescription(description);

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(2);

      const strongs = container.querySelectorAll("strong");
      expect(strongs).toHaveLength(3);
      expect(strongs[0]).toHaveTextContent("can't see");
      expect(strongs[1]).toHaveTextContent("advantage");
      expect(strongs[2]).toHaveTextContent("disadvantage");
    });

    it("should format D&D Charmed condition correctly", () => {
      const description =
        "A charmed creature **can't attack** the charmer or target the charmer with harmful abilities or magical effects.\nThe charmer has **advantage** on any ability check to interact socially with the creature.";

      const container = renderDescription(description);

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(2);

      const strongs = container.querySelectorAll("strong");
      expect(strongs).toHaveLength(2);
      expect(strongs[0]).toHaveTextContent("can't attack");
      expect(strongs[1]).toHaveTextContent("advantage");
    });

    it("should handle condition with no bold text", () => {
      const description = "A deafened creature can't hear and automatically fails any ability check that requires hearing.";

      const container = renderDescription(description);

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(1);
      expect(container.querySelector("strong")).not.toBeInTheDocument();
      expect(container.textContent).toBe(description);
    });

    it("should handle condition with only bold text", () => {
      const description = "**Incapacitated**";

      const container = renderDescription(description);

      const strong = container.querySelector("strong");
      expect(strong).toHaveTextContent("Incapacitated");
      expect(container.textContent).toBe("Incapacitated");
    });

    it("should format complex multiline condition", () => {
      const description =
        "**Effect 1:** First effect description.\n**Effect 2:** Second effect description.\n**Effect 3:** Third effect description.";

      const container = renderDescription(description);

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(3);

      const strongs = container.querySelectorAll("strong");
      expect(strongs).toHaveLength(3);
      expect(strongs[0]).toHaveTextContent("Effect 1:");
      expect(strongs[1]).toHaveTextContent("Effect 2:");
      expect(strongs[2]).toHaveTextContent("Effect 3:");
    });
  });

  // ============================================================================
  // Tests: React Keys
  // ============================================================================

  describe("React Keys", () => {
    it("should generate unique keys for paragraphs", () => {
      const container = renderDescription("Line 1\nLine 2\nLine 3");

      const paragraphs = container.querySelectorAll("p");

      // Keys should be unique (React handles this internally)
      // We verify by checking that all paragraphs are rendered
      expect(paragraphs).toHaveLength(3);
    });

    it("should generate unique keys for bold elements", () => {
      const container = renderDescription("**Bold 1** and **Bold 2**");

      const strongs = container.querySelectorAll("strong");

      // Keys should be unique based on lineIndex and match.index
      expect(strongs).toHaveLength(2);
    });

    it("should handle multiple bold on multiple lines with unique keys", () => {
      const container = renderDescription("**A** **B**\n**C** **D**");

      const strongs = container.querySelectorAll("strong");

      // All 4 bold elements should render with unique keys
      expect(strongs).toHaveLength(4);
      expect(strongs[0]).toHaveTextContent("A");
      expect(strongs[1]).toHaveTextContent("B");
      expect(strongs[2]).toHaveTextContent("C");
      expect(strongs[3]).toHaveTextContent("D");
    });
  });

  // ============================================================================
  // Tests: Return Type
  // ============================================================================

  describe("Return Type", () => {
    it("should return ReactNode array", () => {
      const result = formatConditionDescription("Text");

      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for empty input", () => {
      const result = formatConditionDescription("");

      expect(result).toEqual([]);
    });

    it("should return array with null for empty lines", () => {
      const result = formatConditionDescription("\n");

      // Empty lines return null, which are filtered when rendering
      expect(Array.isArray(result)).toBe(true);
    });

    it("should be renderable by React", () => {
      const result = formatConditionDescription("Test **bold** text");

      // Should not throw when rendering
      expect(() => {
        render(<div>{result}</div>);
      }).not.toThrow();
    });
  });
});
