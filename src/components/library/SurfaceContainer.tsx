import { cn } from "@/lib/utils";

/**
 * Props for SurfaceContainer component
 */
interface SurfaceContainerProps {
  /**
   * Content to display inside the container
   */
  children: React.ReactNode;
  /**
   * Optional additional CSS classes
   */
  className?: string;
  /**
   * Maximum width constraint for the container
   * @default "lg"
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-[400px]",
  md: "max-w-[500px]",
  lg: "max-w-[600px]",
  xl: "max-w-[800px]",
  full: "max-w-full",
};

/**
 * Surface container with card-like appearance
 * Used to group related content with visual separation from the background
 *
 * Features:
 * - Semi-transparent card background
 * - Subtle border
 * - Rounded corners
 * - Configurable max-width
 *
 * Follows Material Design 3 surface container pattern
 *
 * @example
 * ```tsx
 * <SurfaceContainer maxWidth="lg">
 *   <p>Your content here</p>
 * </SurfaceContainer>
 * ```
 */
export function SurfaceContainer({ children, className, maxWidth = "lg" }: SurfaceContainerProps) {
  return (
    <div className={cn("bg-card/50 border border-border/50 rounded-lg p-4", maxWidthClasses[maxWidth], className)}>
      {children}
    </div>
  );
}
