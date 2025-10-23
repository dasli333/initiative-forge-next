import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Common D&D 5e monster types
 */
const MONSTER_TYPES = [
  "Aberration",
  "Beast",
  "Celestial",
  "Construct",
  "Dragon",
  "Elemental",
  "Fey",
  "Fiend",
  "Giant",
  "Humanoid",
  "Monstrosity",
  "Ooze",
  "Plant",
  "Undead",
];

/**
 * Props for TypeFilter component
 */
interface TypeFilterProps {
  /**
   * Currently selected type (null = all types)
   */
  value: string | null;
  /**
   * Callback fired when filter value changes
   */
  onChange: (value: string | null) => void;
}

/**
 * Monster type filter component with select dropdown
 *
 * @param value - Current selected type value
 * @param onChange - Handler for filter changes
 */
export function TypeFilter({ value, onChange }: TypeFilterProps) {
  const handleChange = (newValue: string) => {
    onChange(newValue === "all" ? null : newValue);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Type</Label>
      <Select value={value || "all"} onValueChange={handleChange}>
        <SelectTrigger aria-label="Monster Type Filter">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {MONSTER_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
