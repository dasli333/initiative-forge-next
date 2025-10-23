import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("should handle conditional classes", () => {
    const result = cn("base-class", false && "hidden", "visible-class");
    expect(result).toBe("base-class visible-class");
  });

  it("should merge tailwind classes with conflicts", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("should handle empty inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle undefined and null values", () => {
    const result = cn("base", undefined, null, "final");
    expect(result).toBe("base final");
  });

  it("should merge complex tailwind classes", () => {
    const result = cn(
      "bg-red-500 text-white",
      "bg-blue-500",
      "hover:bg-green-500"
    );
    expect(result).toBe("text-white bg-blue-500 hover:bg-green-500");
  });
});
