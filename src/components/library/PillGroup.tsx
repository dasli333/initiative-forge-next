import { cn } from "@/lib/utils";

/**
 * Props for PillGroup component
 */
interface PillGroupProps {
  /**
   * Label text displayed above the pills
   */
  label: string;
  /**
   * Array of items to display as pills
   */
  items: string[];
  /**
   * Visual variant for the pills
   * @default "default"
   */
  variant?: "default" | "success" | "danger" | "warning" | "info" | "purple";
  /**
   * Custom color for the label
   * @default "text-emerald-500/90"
   */
  labelColor?: string;
  /**
   * Optional additional CSS classes for the container
   */
  className?: string;
}

const variantClasses = {
  default: "bg-muted/50 text-foreground",
  success: "bg-emerald-500/10 text-emerald-400",
  danger: "bg-red-500/10 text-red-400",
  warning: "bg-yellow-500/10 text-yellow-400",
  info: "bg-blue-500/10 text-blue-400",
  purple: "bg-purple-500/10 text-purple-400",
};

/**
 * Group of pills/tags with a label
 * Used to display collections of related items (skills, tags, components, etc.)
 *
 * Features:
 * - Label with emerald accent
 * - Flexbox wrap layout for pills
 * - Multiple color variants
 * - Responsive spacing
 *
 * @example
 * ```tsx
 * <PillGroup
 *   label="Skills:"
 *   items={["Perception +5", "Stealth +7"]}
 *   variant="default"
 * />
 * ```
 */
export function PillGroup({ label, items, variant = "default", labelColor, className }: PillGroupProps) {
  if (!items || !Array.isArray(items) || items.length === 0) return null;

  return (
    <div className={className}>
      <span className={cn("font-semibold block mb-2", labelColor || "text-emerald-500/90")}>{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <span key={idx} className={cn("px-2 py-0.5 rounded text-xs inline-block", variantClasses[variant])}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
