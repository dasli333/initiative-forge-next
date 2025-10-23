import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getDamageTypeColor } from "@/lib/utils/library";

/**
 * Props for DamageBadge component
 */
interface DamageBadgeProps {
  /**
   * Average damage value
   */
  average?: number;
  /**
   * Dice formula (e.g., "2d6+3")
   */
  formula?: string;
  /**
   * Damage type (e.g., "Fire", "Cold", "Slashing")
   */
  type?: string;
  /**
   * Whether to show the damage type text
   * @default true
   */
  showType?: boolean;
  /**
   * Optional additional CSS classes
   */
  className?: string;
}

/**
 * Badge component for displaying damage information
 * Automatically colors based on damage type
 *
 * Features:
 * - Color-coded by damage type (fire=orange, cold=blue, etc.)
 * - Shows average and formula
 * - Hover effect
 * - Responsive sizing
 *
 * @example
 * ```tsx
 * <DamageBadge
 *   average={11}
 *   formula="2d6+3"
 *   type="Fire"
 * />
 * // Output: "11 (2d6+3) Fire" in orange badge
 * ```
 */
export function DamageBadge({ average, formula, type, showType = true, className }: DamageBadgeProps) {
  const colorClasses = getDamageTypeColor(type);

  const displayText = [average !== undefined && `${average}`, formula && `(${formula})`, showType && type && type]
    .filter(Boolean)
    .join(" ");

  return (
    <Badge className={cn(colorClasses, "border hover:opacity-80 transition-opacity", className)}>{displayText}</Badge>
  );
}
