import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatBonus } from "@/lib/utils/library";

/**
 * Props for AttackBadge component
 */
interface AttackBadgeProps {
  /**
   * Attack bonus value
   */
  bonus: number;
  /**
   * Type of attack badge to display
   * @default "attack"
   */
  type?: "attack" | "save";
  /**
   * Optional additional CSS classes
   */
  className?: string;
}

/**
 * Badge component for displaying attack roll or spell attack bonus
 * Uses emerald accent color to match the theme
 *
 * Features:
 * - Emerald color scheme
 * - Formats bonus with + sign
 * - Hover effect
 * - Support for attack and save types
 *
 * @example
 * ```tsx
 * <AttackBadge bonus={7} type="attack" />
 * // Output: "Attack: +7" in emerald badge
 *
 * <AttackBadge bonus={15} type="save" />
 * // Output: "Save DC: 15" in emerald badge
 * ```
 */
export function AttackBadge({ bonus, type = "attack", className }: AttackBadgeProps) {
  const displayText = type === "attack" ? `Attack: ${formatBonus(bonus)}` : `Save DC: ${bonus}`;

  return (
    <Badge
      className={cn(
        "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
        "hover:bg-emerald-500/20 transition-colors",
        className
      )}
    >
      {displayText}
    </Badge>
  );
}
