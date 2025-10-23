/**
 * Gradient horizontal separator
 * Used to visually separate sections in library views (monsters, spells, etc.)
 *
 * Provides a subtle gradient line that fades from transparent on the edges
 * to the border color in the center, creating an elegant section divider.
 *
 * @example
 * ```tsx
 * <section>Content 1</section>
 * <GradientSeparator />
 * <section>Content 2</section>
 * ```
 */
export function GradientSeparator() {
  return <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />;
}
