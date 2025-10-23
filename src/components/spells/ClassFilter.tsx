import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Props for ClassFilter component
 */
interface ClassFilterProps {
  /**
   * Current selected class (null for "All")
   */
  value: string | null;
  /**
   * Callback fired when class selection changes
   */
  onChange: (className: string | null) => void;
}

/**
 * D&D 5e spellcasting class options for filtering
 */
const CLASS_OPTIONS = [
  { value: "all", label: "All Classes" },
  { value: "Bard", label: "Bard" },
  { value: "Cleric", label: "Cleric" },
  { value: "Druid", label: "Druid" },
  { value: "Paladin", label: "Paladin" },
  { value: "Ranger", label: "Ranger" },
  { value: "Sorcerer", label: "Sorcerer" },
  { value: "Warlock", label: "Warlock" },
  { value: "Wizard", label: "Wizard" },
];

/**
 * Filter component for spell class selection
 * Provides a dropdown to filter spells by spellcasting class
 *
 * @param value - Current selected class
 * @param onChange - Handler called when selection changes
 */
export function ClassFilter({ value, onChange }: ClassFilterProps) {
  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === "all") {
      onChange(null);
    } else {
      onChange(selectedValue);
    }
  };

  // Convert value to string for Select component
  const selectValue = value === null ? "all" : value;

  return (
    <div className="flex flex-col gap-1.5 min-w-[180px]">
      <label htmlFor="class-filter" className="text-xs text-muted-foreground font-medium">
        Class
      </label>
      <Select value={selectValue} onValueChange={handleValueChange}>
        <SelectTrigger id="class-filter" className="w-full" aria-label="Filter by spell class">
          <SelectValue placeholder="Select class" />
        </SelectTrigger>
        <SelectContent>
          {CLASS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
