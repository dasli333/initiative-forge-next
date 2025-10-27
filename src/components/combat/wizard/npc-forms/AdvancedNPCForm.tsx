import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import type { AdvancedNPCFormData, ActionDTO } from "../types";

/**
 * Props for AdvancedNPCForm component
 */
interface AdvancedNPCFormProps {
  /**
   * Form data
   */
  form: AdvancedNPCFormData;
  /**
   * Callback when form data changes
   */
  onChange: (updates: Partial<AdvancedNPCFormData>) => void;
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
 * Advanced mode form for creating NPCs with full stats and actions
 */
export function AdvancedNPCForm({ form, onChange, onAdd, isValid }: AdvancedNPCFormProps) {
  const handleStatChange = useCallback(
    (stat: keyof typeof form.stats, value: number) => {
      onChange({
        stats: {
          ...form.stats,
          [stat]: value,
        },
      });
    },
    [form, onChange]
  );

  const handleAddAction = useCallback(() => {
    const newAction: ActionDTO = {
      name: "",
      type: "melee_weapon_attack",
      attack_bonus: 0,
      damage_dice: "1d6",
      damage_bonus: 0,
      damage_type: "slashing",
      description: "",
    };

    onChange({
      actions: [...form.actions, newAction],
    });
  }, [form.actions, onChange]);

  const handleRemoveAction = useCallback(
    (index: number) => {
      onChange({
        actions: form.actions.filter((_, i) => i !== index),
      });
    },
    [form.actions, onChange]
  );

  const handleActionChange = useCallback(
    (index: number, updates: Partial<ActionDTO>) => {
      const newActions = [...form.actions];
      newActions[index] = { ...newActions[index], ...updates };
      onChange({ actions: newActions });
    },
    [form.actions, onChange]
  );

  return (
    <div className="border border-border rounded-lg p-6 space-y-6 bg-card shadow-sm">
      <h3 className="text-lg font-semibold">Create Advanced NPC</h3>

      <div className="space-y-4">
        {/* Basic Info */}
        <div>
          <Label htmlFor="adv-npc-name">Name *</Label>
          <Input
            id="adv-npc-name"
            type="text"
            value={form.display_name}
            onChange={(e) => onChange({ display_name: e.target.value })}
            placeholder="e.g., Bandit Leader"
            maxLength={255}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="adv-npc-hp">Max HP *</Label>
            <Input
              id="adv-npc-hp"
              type="number"
              min="1"
              value={form.max_hp}
              onChange={(e) => onChange({ max_hp: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div>
            <Label htmlFor="adv-npc-ac">AC *</Label>
            <Input
              id="adv-npc-ac"
              type="number"
              min="0"
              value={form.armor_class}
              onChange={(e) => onChange({ armor_class: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label htmlFor="adv-npc-speed">Speed *</Label>
            <Input
              id="adv-npc-speed"
              type="text"
              value={form.speed}
              onChange={(e) => onChange({ speed: e.target.value })}
              placeholder="30 ft"
            />
          </div>
        </div>

        {/* Ability Scores */}
        <div>
          <Label className="mb-3 block">Ability Scores *</Label>
          <div className="grid grid-cols-3 gap-4">
            {(["str", "dex", "con", "int", "wis", "cha"] as const).map((stat) => (
              <div key={stat}>
                <Label htmlFor={`stat-${stat}`} className="text-xs uppercase">
                  {stat}
                </Label>
                <Input
                  id={`stat-${stat}`}
                  type="number"
                  min="1"
                  max="30"
                  value={form.stats[stat]}
                  onChange={(e) => handleStatChange(stat, parseInt(e.target.value) || 10)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Actions</Label>
            <Button type="button" size="sm" variant="outline" onClick={handleAddAction}>
              <Plus className="w-4 h-4 mr-1" />
              Add Action
            </Button>
          </div>

          {form.actions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No actions added</p>
          ) : (
            <div className="space-y-3">
              {form.actions.map((action, index) => (
                <div key={index} className="border border-border rounded-lg p-3 relative bg-muted/30">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveAction(index)}
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>

                  <div className="grid grid-cols-2 gap-3 pr-8">
                    <Input
                      placeholder="Action name"
                      value={action.name}
                      onChange={(e) => handleActionChange(index, { name: e.target.value })}
                    />
                    <Input
                      placeholder="Type"
                      value={action.type}
                      onChange={(e) => handleActionChange(index, { type: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Attack bonus"
                      value={action.attack_bonus ?? ""}
                      onChange={(e) =>
                        handleActionChange(index, {
                          attack_bonus: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <Input
                      placeholder="Damage dice"
                      value={action.damage_dice ?? ""}
                      onChange={(e) => handleActionChange(index, { damage_dice: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button onClick={onAdd} disabled={!isValid} className="w-full" size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Add NPC
        </Button>
      </div>
    </div>
  );
}
