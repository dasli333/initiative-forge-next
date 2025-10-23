import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * D&D 5e creature sizes (ordered from smallest to largest)
 */
const MONSTER_SIZES = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];

/**
 * Props for SizeFilter component
 */
interface SizeFilterProps {
  /**
   * Currently selected size (null = all sizes)
   */
  value: string | null;
  /**
   * Callback fired when filter value changes
   */
  onChange: (value: string | null) => void;
}

/**
 * Monster size filter component with select dropdown
 *
 * @param value - Current selected size value
 * @param onChange - Handler for filter changes
 */
export function SizeFilter({ value, onChange }: SizeFilterProps) {
  const handleChange = (newValue: string) => {
    onChange(newValue === "all" ? null : newValue);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Size</Label>
      <Select value={value || "all"} onValueChange={handleChange}>
        <SelectTrigger aria-label="Monster Size Filter">
          <SelectValue placeholder="All sizes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sizes</SelectItem>
          {MONSTER_SIZES.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
