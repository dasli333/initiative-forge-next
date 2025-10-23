// Radio group for selecting roll mode (normal/advantage/disadvantage)

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Equal, TrendingUp, TrendingDown } from "lucide-react";
import type { RollMode } from "@/types/combat-view.types";

interface RollControlsProps {
  value: RollMode;
  onChange: (mode: RollMode) => void;
}

export function RollControls({ value, onChange }: RollControlsProps) {
  return (
    <div className="space-y-3">
      <Label>Roll Mode</Label>
      <RadioGroup value={value} onValueChange={(val) => onChange(val as RollMode)} className="flex gap-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="normal" id="normal" />
          <Label htmlFor="normal" className="flex items-center gap-1 font-normal cursor-pointer">
            <Equal className="h-4 w-4" />
            Normal
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="advantage" id="advantage" />
          <Label htmlFor="advantage" className="flex items-center gap-1 font-normal cursor-pointer">
            <TrendingUp className="h-4 w-4" />
            Advantage
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="disadvantage" id="disadvantage" />
          <Label htmlFor="disadvantage" className="flex items-center gap-1 font-normal cursor-pointer">
            <TrendingDown className="h-4 w-4" />
            Disadvantage
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
