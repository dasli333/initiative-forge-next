import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * D&D 5e alignment options
 */
const ALIGNMENTS = [
  "Lawful good",
  "Neutral good",
  "Chaotic good",
  "Lawful neutral",
  "True neutral",
  "Chaotic neutral",
  "Lawful evil",
  "Neutral evil",
  "Chaotic evil",
  "Unaligned",
  "Any alignment",
];

/**
 * Props for AlignmentFilter component
 */
interface AlignmentFilterProps {
  /**
   * Currently selected alignment (null = all alignments)
   */
  value: string | null;
  /**
   * Callback fired when filter value changes
   */
  onChange: (value: string | null) => void;
}

/**
 * Monster alignment filter component with select dropdown
 *
 * @param value - Current selected alignment value
 * @param onChange - Handler for filter changes
 */
export function AlignmentFilter({ value, onChange }: AlignmentFilterProps) {
  const handleChange = (newValue: string) => {
    onChange(newValue === "all" ? null : newValue);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Alignment</Label>
      <Select value={value || "all"} onValueChange={handleChange}>
        <SelectTrigger aria-label="Monster Alignment Filter">
          <SelectValue placeholder="All alignments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All alignments</SelectItem>
          {ALIGNMENTS.map((alignment) => (
            <SelectItem key={alignment} value={alignment}>
              {alignment}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
