import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import type { Step4Props, SimpleNPCFormData, AdvancedNPCFormData, AdHocNPC, ActionDTO } from "./types";

export function Step4_AddNPCs({
  mode,
  onModeChange,
  npcForm,
  onFormChange,
  onAddNPC,
  addedNPCs,
  onRemoveNPC,
  onBack,
  onNext,
  isFormValid,
}: Step4Props) {
  const handleModeToggle = useCallback(
    (checked: boolean) => {
      const newMode = checked ? "advanced" : "simple";
      // TODO: Add confirmation modal if form has data
      onModeChange(newMode);
    },
    [onModeChange]
  );

  return (
    <div className="max-w-5xl mx-auto">
      <h2 id="step-4-heading" className="text-2xl font-bold mb-6" tabIndex={-1}>
        Add NPCs (Optional)
      </h2>

      <p className="text-muted-foreground mb-6">
        Create custom NPCs for this combat. You can skip this step if not needed.
      </p>

      {/* Mode Toggle */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-muted/50 rounded-lg border border-border">
        <Label htmlFor="mode-toggle" className="font-medium">
          Simple Mode
        </Label>
        <Switch id="mode-toggle" checked={mode === "advanced"} onCheckedChange={handleModeToggle} />
        <Label htmlFor="mode-toggle" className="font-medium">
          Advanced Mode
        </Label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NPC Form */}
        <div className="lg:col-span-2">
          {mode === "simple" ? (
            <SimpleNPCForm
              form={npcForm as SimpleNPCFormData}
              onChange={onFormChange}
              onAdd={onAddNPC}
              isValid={isFormValid}
            />
          ) : (
            <AdvancedNPCForm
              form={npcForm as AdvancedNPCFormData}
              onChange={onFormChange}
              onAdd={onAddNPC}
              isValid={isFormValid}
            />
          )}
        </div>

        {/* Added NPCs List */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 border border-border rounded-lg p-4 bg-card shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Added NPCs ({addedNPCs.length})</h3>

            {addedNPCs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">No NPCs added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {addedNPCs.map((npc) => (
                  <AddedNPCCard key={npc.id} npc={npc} onRemove={onRemoveNPC} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <Button onClick={onNext} size="lg">
          Next
        </Button>
      </div>
    </div>
  );
}

// Simple NPC Form
function SimpleNPCForm({
  form,
  onChange,
  onAdd,
  isValid,
}: {
  form: SimpleNPCFormData;
  onChange: (updates: Partial<SimpleNPCFormData>) => void;
  onAdd: () => void;
  isValid: boolean;
}) {
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

// Advanced NPC Form
function AdvancedNPCForm({
  form,
  onChange,
  onAdd,
  isValid,
}: {
  form: AdvancedNPCFormData;
  onChange: (updates: Partial<AdvancedNPCFormData>) => void;
  onAdd: () => void;
  isValid: boolean;
}) {
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

// Added NPC Card
function AddedNPCCard({ npc, onRemove }: { npc: AdHocNPC; onRemove: (npcId: string) => void }) {
  return (
    <div className="flex items-start justify-between p-3 bg-gradient-to-r from-card via-card/80 to-emerald-500/5 rounded-lg border border-border shadow-sm">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{npc.display_name}</p>
        <div className="flex gap-2 mt-1">
          <Badge variant="secondary" className="text-xs">
            HP: {npc.max_hp}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            AC: {npc.armor_class}
          </Badge>
        </div>
      </div>

      <Button size="sm" variant="ghost" onClick={() => onRemove(npc.id)} className="h-8 w-8 p-0 flex-shrink-0">
        <X className="w-4 h-4" />
        <span className="sr-only">Remove {npc.display_name}</span>
      </Button>
    </div>
  );
}
