import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils/test-utils";
import { Button } from "./button";

describe("Button Component", () => {
  it("should render button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("should handle click events", async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole("button");

    expect(button).toBeDisabled();
  });

  it("should apply default variant styles", () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole("button");

    expect(button).toHaveClass("bg-primary");
  });

  it("should apply destructive variant styles", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button");

    expect(button).toHaveClass("bg-destructive");
  });

  it("should apply outline variant styles", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole("button");

    expect(button).toHaveClass("border");
  });

  it("should apply small size styles", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole("button");

    expect(button).toHaveClass("h-8");
  });

  it("should apply large size styles", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole("button");

    expect(button).toHaveClass("h-10");
  });

  it("should apply custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole("button");

    expect(button).toHaveClass("custom-class");
  });

  it("should render as child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });
});
