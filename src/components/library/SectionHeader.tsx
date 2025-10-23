import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * Props for SectionHeader component
 */
interface SectionHeaderProps {
  /**
   * Lucide icon component to display before the title
   */
  icon: LucideIcon;
  /**
   * Section title text
   */
  title: string;
  /**
   * Optional additional CSS classes
   */
  className?: string;
}

/**
 * Section header with icon and title
 * Used to create consistent, visually appealing section headers across library views
 *
 * Features:
 * - Icon + title layout
 * - Emerald accent color
 * - Consistent sizing and spacing
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   icon={Swords}
 *   title="Actions"
 * />
 * ```
 */
export function SectionHeader({ icon: Icon, title, className }: SectionHeaderProps) {
  return (
    <h3 className={cn("flex items-center gap-2 text-base font-bold mb-3 text-emerald-500", className)}>
      <Icon className="h-5 w-5" />
      {title}
    </h3>
  );
}
