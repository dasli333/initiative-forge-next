import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Props for LevelFilter component
 */
interface LevelFilterProps {
  /**
   * Current selected level (0-9, null for "All")
   */
  value: number | null;
  /**
   * Callback fired when level selection changes
   */
  onChange: (level: number | null) => void;
}

/**
 * Spell level options for filtering (0 = Cantrip, 1-9 = Spell levels)
 */
const LEVEL_OPTIONS = [
  { value: "all", label: "All Levels" },
  { value: "0", label: "Cantrip" },
  { value: "1", label: "1st Level" },
  { value: "2", label: "2nd Level" },
  { value: "3", label: "3rd Level" },
  { value: "4", label: "4th Level" },
  { value: "5", label: "5th Level" },
  { value: "6", label: "6th Level" },
  { value: "7", label: "7th Level" },
  { value: "8", label: "8th Level" },
  { value: "9", label: "9th Level" },
];

/**
 * Filter component for spell level selection
 * Provides a dropdown to filter spells by level (Cantrip through 9th level)
 *
 * @param value - Current selected level
 * @param onChange - Handler called when selection changes
 */
export function LevelFilter({ value, onChange }: LevelFilterProps) {
  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === "all") {
      onChange(null);
    } else {
      onChange(parseInt(selectedValue, 10));
    }
  };

  // Convert value to string for Select component
  const selectValue = value === null ? "all" : String(value);

  return (
    <div className="flex flex-col gap-1.5 min-w-[180px]">
      <label htmlFor="level-filter" className="text-xs text-muted-foreground font-medium">
        Level
      </label>
      <Select value={selectValue} onValueChange={handleValueChange}>
        <SelectTrigger id="level-filter" className="w-full" aria-label="Filter by spell level">
          <SelectValue placeholder="Select level" />
        </SelectTrigger>
        <SelectContent>
          {LEVEL_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
