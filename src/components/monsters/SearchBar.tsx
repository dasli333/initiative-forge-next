import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Props for SearchBar component
 */
interface SearchBarProps {
  /**
   * Current search value (controlled component)
   */
  value: string;
  /**
   * Callback fired when search value changes
   */
  onChange: (value: string) => void;
  /**
   * Placeholder text for the input
   * @default "Search monsters..."
   */
  placeholder?: string;
}

/**
 * Search input component for filtering monsters by name
 * Includes search icon and proper ARIA attributes for accessibility
 *
 * Note: Debouncing is handled by the parent component (MonstersLibraryView)
 * This component updates immediately for better UX
 *
 * @param value - Controlled input value
 * @param onChange - Handler for value changes
 * @param placeholder - Input placeholder text
 */
export function SearchBar({ value, onChange, placeholder = "Search monsters..." }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
        aria-label="Search monsters"
        aria-describedby="search-hint"
      />
      <span id="search-hint" className="sr-only">
        Search monsters by name. Results update automatically as you type.
      </span>
    </div>
  );
}
