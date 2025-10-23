import React, { type ReactNode } from "react";

/**
 * Formats condition description text by:
 * 1. Splitting on newlines
 * 2. Converting **bold text** to <strong> elements
 * 3. Returning formatted React nodes
 *
 * @param description - Raw description text with markdown-like formatting
 * @returns Array of React nodes with proper formatting
 */
export function formatConditionDescription(description: string): ReactNode[] {
  // Split by newlines to create separate lines
  const lines = description.split("\n");

  return lines
    .map((line, lineIndex) => {
      // Skip empty lines
      if (line.trim() === "") {
        return null;
      }

      // Parse **bold** markers within the line
      const parts: ReactNode[] = [];
      let lastIndex = 0;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        // Add text before the bold marker
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }

        // Add bold text
        parts.push(
          <strong key={`bold-${lineIndex}-${match.index}`} className="font-semibold">
            {match[1]}
          </strong>
        );

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text after the last bold marker
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      // Return the line as a paragraph (or div)
      return (
        <p key={`line-${lineIndex}`} className="mb-2 last:mb-0">
          {parts}
        </p>
      );
    })
    .filter((node): node is React.ReactElement => node !== null);
}
