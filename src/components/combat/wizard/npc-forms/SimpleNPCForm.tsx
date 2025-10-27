import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import type { SimpleNPCFormData } from "../types";

/**
 * Props for SimpleNPCForm component
 */
interface SimpleNPCFormProps {
  /**
   * Form data
   */
  form: SimpleNPCFormData;
  /**
   * Callback when form data changes
   */
  onChange: (updates: Partial<SimpleNPCFormData>) => void;
  /**
   * Callback when add button is clicked
   */
  onAdd: () => void;
  /**
   * Whether the form is valid
   */
  isValid: boolean;
}

/**
 * Simple mode form for creating NPCs with basic stats
 */
export function SimpleNPCForm({ form, onChange, onAdd, isValid }: SimpleNPCFormProps) {
  return (
    <div className="border border-border rounded-lg p-6 space-y-4 bg-card shadow-sm">
      <h3 className="text-lg font-semibold">Create Simple NPC</h3>

      <div className="space-y-4">
        <div>
          <Label htmlFor="npc-name">Name *</Label>
          <Input
            id="npc-name"
            type="text"
            value={form.display_name}
            onChange={(e) => onChange({ display_name: e.target.value })}
            placeholder="e.g., Bandit Leader"
            maxLength={255}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="npc-hp">Max HP *</Label>
            <Input
              id="npc-hp"
              type="number"
              min="1"
              value={form.max_hp}
              onChange={(e) => onChange({ max_hp: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div>
            <Label htmlFor="npc-ac">Armor Class *</Label>
            <Input
              id="npc-ac"
              type="number"
              min="0"
              value={form.armor_class}
              onChange={(e) => onChange({ armor_class: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="npc-init">Initiative Modifier</Label>
          <Input
            id="npc-init"
            type="number"
            value={form.initiative_modifier ?? 0}
            onChange={(e) => onChange({ initiative_modifier: parseInt(e.target.value) || 0 })}
            placeholder="e.g., +2"
          />
          <p className="text-sm text-muted-foreground mt-1">Used to calculate DEX modifier</p>
        </div>

        <Button onClick={onAdd} disabled={!isValid} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add NPC
        </Button>
      </div>
    </div>
  );
}
